
const svg = document.getElementById("drawing-area");
const NS = "http://www.w3.org/2000/svg";

// 方眼の描画
for (let k = -2000; k <= 4000; k += 20) {

    const line1 = document.createElementNS(NS, "line");
    line1.setAttribute("x1", 0);
    line1.setAttribute("y1", k);
    line1.setAttribute("x2", 2000);
    line1.setAttribute("y2", k - 2000);
    line1.setAttribute("stroke", "#cccccc");
    line1.setAttribute("stroke-width", 1);
    svg.appendChild(line1);

    const line2 = document.createElementNS(NS, "line");
    line2.setAttribute("x1", 0);
    line2.setAttribute("y1", -k);
    line2.setAttribute("x2", 2000);
    line2.setAttribute("y2", 2000 - k);
    line2.setAttribute("stroke", "#cccccc");
    line2.setAttribute("stroke-width", 1);
    svg.appendChild(line2);
}

// 色付きエリア（外側）
const RedZone = document.createElementNS(NS, "polygon");

RedZone.setAttribute(
    "points",
    "500,220 780,500 500,780 220,500"
);
RedZone.setAttribute("fill", "#ff9999");
RedZone.setAttribute("fill-opacity", "0.3");
RedZone.setAttribute("stroke", "red");
RedZone.setAttribute("stroke-width", "2");

svg.appendChild(RedZone);

// 侵入不可エリア（内側）
const restricted = document.createElementNS(NS, "polygon");

restricted.setAttribute(
    "points",
    "500,380 620,500 500,620 380,500"
);
restricted.setAttribute("fill", "#ff9999");
restricted.setAttribute("fill-opacity", "0.3");
restricted.setAttribute("stroke", "red");
restricted.setAttribute("stroke-width", "2");

svg.appendChild(restricted);


 // 侵入不可エリアの角に置く4つの色付きエリア
const cornerAreas = [
    {x:500, y:400, name:"砲台:北", color:"#ffcc66"},
    {x:600, y:500, name:"砲台:東", color:"#ffcc66"},
    {x:500, y:600, name:"砲台:南", color:"#ffcc66"},
    {x:400, y:500, name:"砲台:西", color:"#ffcc66"}
];

cornerAreas.forEach(area => {

    const group = document.createElementNS(NS, "g");

    group.setAttribute(
        "transform",
        `translate(${area.x},${area.y})`
    );

    // 2×2の菱形
    const shape = document.createElementNS(NS, "polygon");
    shape.setAttribute(
        "points",
        "0,-20 20,0 0,20 -20,0"
    );
    shape.setAttribute("fill", area.color);
    shape.setAttribute("stroke", "#333");
    group.appendChild(shape);

    // 名前
    const text = document.createElementNS(NS, "text");
    text.setAttribute("x", 0);
    text.setAttribute("y", 0);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", 10);
    text.textContent = area.name;
    group.appendChild(text);

    svg.appendChild(group);
});



// オブジェクト専用レイヤー
const objectsLayer = document.createElementNS(NS, "g");
svg.appendChild(objectsLayer);

// オブジェクト管理用データ
const objects = [];
let nextId = 1;
let drag = null;
let editingObject = null;
let currentTeam = 1;

// 配置可能か判定
function canPlace(x, y, ignoreObj = null) {

    const u = x + y;
    const v = x - y;

    // 侵入不可エリアとの重なり
    if (Math.max(Math.abs(u - 1000), Math.abs(v)) < 140) {
        return false;
    }

    // 他のオブジェクトとの重なり
    for (const obj of objects) {
        if (obj === ignoreObj) continue;

        const ou = obj.x + obj.y;
        const ov = obj.x - obj.y;

        if (
            Math.abs(u - ou) < 40 &&
            Math.abs(v - ov) < 40
        ) {
            return false;
        }
    }

    return true;
}

// SVG座標の取得
function getSVGPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    return point.matrixTransform(
        svg.getScreenCTM().inverse()
    );
}

// 編集画面を開く
function openEditPopup(obj) {

    editingObject = obj;

    document.getElementById("edit-name").value = obj.text;
    document.getElementById("edit-team").value =
    obj.color === "#4dff88" ? "2" : "1";
    document.getElementById("edit-popup").style.display = "block";
}


 // 名前の即時反映
document.getElementById("edit-name").addEventListener("input", function() {

    if (!editingObject) return;

    editingObject.text = this.value;

    const group = document.getElementById("object_" + editingObject.id);
    const oldText = group.querySelector("text");
    oldText.remove();

    const text = document.createElementNS(NS, "text");
    text.setAttribute("x", 0);
    text.setAttribute("y", 0);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", 8);

    const name = this.value;

    if (name.length <= 4) {
        text.textContent = name;
    } else {
        const tspan1 = document.createElementNS(NS, "tspan");
        const tspan2 = document.createElementNS(NS, "tspan");

        tspan1.setAttribute("x", 0);
        tspan1.setAttribute("dy", "-0.5em");
        tspan1.textContent = name.slice(0, Math.ceil(name.length / 2));

        tspan2.setAttribute("x", 0);
        tspan2.setAttribute("dy", "1em");
        tspan2.textContent = name.slice(Math.ceil(name.length / 2));

        text.appendChild(tspan1);
        text.appendChild(tspan2);
    }

    group.appendChild(text);
});


// チームの即時反映
document.getElementById("edit-team").addEventListener("change", function() {
    if (!editingObject) return;

    const color = this.value === "1" ? "#4da6ff" : "#4dff88";

    editingObject.color = color;

    const group = document.getElementById("object_" + editingObject.id);
    group.querySelector("polygon").setAttribute("fill", color);
});

// 閉じる
document.getElementById("edit-close").addEventListener("click", function() {

    document.getElementById("edit-popup").style.display = "none";
    editingObject = null;
});

// オブジェクト描画
function drawObject(obj) {

    const group = document.createElementNS(NS, "g");

    group.setAttribute("id", "object_" + obj.id);
    group.setAttribute(
        "transform",
        `translate(${obj.x},${obj.y})`
    );

    // 外周だけを描画
    const shape = document.createElementNS(NS, "polygon");

    shape.setAttribute(
        "points",
        "0,-20 20,0 0,20 -20,0"
    );

    shape.setAttribute("fill", obj.color);
    shape.setAttribute("stroke", "#333333");
    shape.setAttribute("stroke-width", "1");
    shape.setAttribute("fill-opacity", "1");

    group.appendChild(shape);

    // 文字
const text = document.createElementNS(NS, "text");

text.setAttribute("x", 0);
text.setAttribute("y", 0);
text.setAttribute("text-anchor", "middle");
text.setAttribute("dominant-baseline", "middle");
text.setAttribute("font-size", 8);

const name = obj.text;

if (name.length <= 4) {
    text.textContent = name;
} else {
    const tspan1 = document.createElementNS(NS, "tspan");
    const tspan2 = document.createElementNS(NS, "tspan");

    tspan1.setAttribute("x", 0);
    tspan1.setAttribute("dy", "-0.5em");
    tspan1.textContent = name.slice(0, Math.ceil(name.length / 2));

    tspan2.setAttribute("x", 0);
    tspan2.setAttribute("dy", "1em");
    tspan2.textContent = name.slice(Math.ceil(name.length / 2));

    text.appendChild(tspan1);
    text.appendChild(tspan2);
}

group.appendChild(text);

        // ドラッグ開始
    group.addEventListener("pointerdown", function(event) {

        event.preventDefault();

        const point = getSVGPoint(event);

        drag = {
            obj: obj,
            group: group,
            startX: obj.x,
            startY: obj.y,
            startPoint: point,
            pointerStartX: event.clientX,
            pointerStartY: event.clientY,
            moved: false
        };

        svg.setPointerCapture(event.pointerId);
    });

    objectsLayer.appendChild(group);
}

// 空白部分をドラッグして画面移動
svg.addEventListener("pointerdown", function(event) {

    if (event.target.closest('g[id^="object_"]')) return;

    event.preventDefault();

    const v = svg.viewBox.baseVal;

    drag = {
        type: "pan",
        startX: event.clientX,
        startY: event.clientY,
        viewX: v.x,
        viewY: v.y,
        width: v.width,
        height: v.height
    };

    svg.setPointerCapture(event.pointerId);
});

// ドラッグ中
svg.addEventListener("pointermove", function(event) {

    if (!drag) return;

    if (drag.type === "pan") {
        const rect = svg.getBoundingClientRect();

        const x = drag.viewX
            - (event.clientX - drag.startX) * drag.width / rect.width;

        const y = drag.viewY
            - (event.clientY - drag.startY) * drag.height / rect.height;

        svg.setAttribute("viewBox",
            `${x} ${y} ${drag.width} ${drag.height}`);

        return;
    }

        // タップとドラッグを判定
    const distance = Math.hypot(
        event.clientX - drag.pointerStartX,
        event.clientY - drag.pointerStartY
    );

    if (distance > 5) {
        drag.moved = true;
    }

    const point = getSVGPoint(event);

    drag.obj.x = drag.startX + point.x - drag.startPoint.x;
    drag.obj.y = drag.startY + point.y - drag.startPoint.y;

    drag.group.setAttribute(
        "transform",
        `translate(${drag.obj.x},${drag.obj.y})`
    );
});



// ドラッグ終了・方眼補正
svg.addEventListener("pointerup", function(event) {

    if (!drag) return;

    if (drag.type == "pan") {
        drag = null;
        return;
    }

    const current = drag;
    
    // タップなら編集画面を開く
    if (!current.moved) {
        openEditPopup(current.obj);
        drag = null;
        return;
    }

    let x = current.obj.x;
    let y = current.obj.y;

    // 方眼の2方向の座標
    let u = x + y;
    let v = x - y;

    // 最寄りの方眼交点へ補正
    u = Math.round(u / 20) * 20;
    v = Math.round(v / 20) * 20;

    x = (u + v) / 2;
    y = (u - v) / 2;

    if (!canPlace(x, y, current.obj)) {
        x = current.startX;
        y = current.startY;
    }

    current.obj.x = x;
    current.obj.y = y;

    current.group.setAttribute(
        "transform",
        `translate(${x},${y})`
    );

    drag = null;
});


// 生成ボタン
const createButton = document.getElementById("create-object");

createButton.addEventListener("click", function() {

    const obj = {
        id: nextId,
        type: "2x2",
        x: 500,
        y: 500,
        text: "A",
        color: currentTeam === 1 ? "#4da6ff" : "#4dff88"
    };

    objects.push(obj);
    nextId++;

    drawObject(obj);
});

// 侵入不可エリアを囲む一斉生成
const ringButton = document.getElementById("create-ring");

ringButton.addEventListener("click", function() {

    const positions = new Map();

    // 方眼座標で外周を作成
    for (let t = -140; t <= 140; t += 40) {

        const points = [
            [140, t],
            [-140, t],
            [t, 140],
            [t, -140]
        ];

        points.forEach(([u, v]) => {
            positions.set(`${u},${v}`, [u, v]);
        });
    }

    // オブジェクト生成
    positions.forEach(([u, v]) => {
        
        const x = 500 + (u+v)/2;
        const y = 500 + (u-v)/2;
        
        if(!canPlace(x,y)) return;

        const obj = {
            id: nextId,
            type: "2x2",
            x: 500 + (u + v) / 2,
            y: 500 + (u - v) / 2,
            text: String(nextId),
            color: currentTeam === 1 ? "#4da6ff" : "#4dff88"
        };

        objects.push(obj);
        nextId++;

        drawObject(obj);
    });
});


// 全体画像生成
const generateImageButton =
    document.getElementById("generate-image");

const imagePreview =
    document.getElementById("image-preview");

generateImageButton.addEventListener("click", function() {

    // SVGを複製
    const clone = svg.cloneNode(true);

    // 画像サイズを指定
    clone.setAttribute("width", 1000);
    clone.setAttribute("height", 1000);

    // SVGを文字列に変換
    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(clone);

    // SVGを画像データにする
    const svgBlob = new Blob(
        [svgText],
        { type: "image/svg+xml" }
    );

    const url = URL.createObjectURL(svgBlob);

    const img = new Image();

    img.onload = function() {

        // Canvasに描画
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 1000;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // PNGに変換して表示
        imagePreview.src = canvas.toDataURL("image/png");

        URL.revokeObjectURL(url);
    };

    img.src = url;
});

let pinch = 0, vb;

function getDistance(a, b) {
    return Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
}

svg.addEventListener("touchstart", e => {
    if (e.touches.length == 2) {
        drag = null;
        pinch = getDistance(e.touches[0], e.touches[1]);
        let v = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
        vb = {
            x:v.x, y:v.y, w:v.width, h:v.height,
            cx:(e.touches[0].clientX+e.touches[1].clientX)/2,
            cy:(e.touches[0].clientY+e.touches[1].clientY)/2,
            px:(e.touches[0].clientX+e.touches[1].clientX)/2-r.left,
            py:(e.touches[0].clientY+e.touches[1].clientY)/2-r.top,
            rw:r.width, rh:r.height
        };
    }
}, {passive:false});

svg.addEventListener("touchmove", e => {
    if (e.touches.length != 2 || !pinch) return;
    e.preventDefault();

    let s = pinch / getDistance(e.touches[0], e.touches[1]);
    let w = Math.max(100, Math.min(1000, vb.w*s));
    let h = w;
    let x = vb.x + vb.px/vb.rw*vb.w - vb.px/vb.rw*w;
    let y = vb.y + vb.py/vb.rh*vb.h - vb.py/vb.rh*h;

    svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}, {passive:false});

svg.addEventListener("touchend", e => {
    if (e.touches.length < 2) {
        pinch = 0;

        // 全体表示に近ければ正確に初期位置へ戻す
        let v = svg.viewBox.baseVal;
        if (Math.abs(v.width - 1000) < 1) {
            svg.setAttribute("viewBox", "0 0 1000 1000");
        }
    }
});

// チーム設定画面を開く
document.getElementById("team-settings").addEventListener("click", function() {
    document.getElementById("team-popup").style.display = "block";
});

// チーム設定画面を閉じる
document.getElementById("team-close").addEventListener("click", function() {
    document.getElementById("team-popup").style.display = "none";
});

// チーム選択
document.getElementById("select-team-1").addEventListener("click", function() {
    currentTeam = 1;
    document.getElementById("team-popup").style.display = "none";
});

document.getElementById("select-team-2").addEventListener("click", function() {
    currentTeam = 2;
    document.getElementById("team-popup").style.display = "none";
});

// 全オブジェクトを消去
document.getElementById("clear-objects").addEventListener("click", function() {
    objects.length=0;
    objectsLayer.innerHTML = "";
});

