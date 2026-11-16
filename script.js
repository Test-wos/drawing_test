
const svg = document.getElementById("drawing-area");
const NS = "http://www.w3.org/2000/svg";

// 方眼の描画
for (let k = -300; k <= 600; k += 20) {

    const line1 = document.createElementNS(NS, "line");
    line1.setAttribute("x1", 0);
    line1.setAttribute("y1", k);
    line1.setAttribute("x2", 300);
    line1.setAttribute("y2", k - 300);
    line1.setAttribute("stroke", "#cccccc");
    line1.setAttribute("stroke-width", 1);
    svg.appendChild(line1);

    const line2 = document.createElementNS(NS, "line");
    line2.setAttribute("x1", 0);
    line2.setAttribute("y1", -k);
    line2.setAttribute("x2", 300);
    line2.setAttribute("y2", 300 - k);
    line2.setAttribute("stroke", "#cccccc");
    line2.setAttribute("stroke-width", 1);
    svg.appendChild(line2);
}

// オブジェクト専用レイヤー
const objectsLayer = document.createElementNS(NS, "g");
svg.appendChild(objectsLayer);

// オブジェクト管理用データ
const objects = [];
let nextId = 1;
let drag = null;


// SVG座標の取得
function getSVGPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    return point.matrixTransform(
        svg.getScreenCTM().inverse()
    );
}


// オブジェクト描画
function drawObject(obj) {

    const group = document.createElementNS(NS, "g");

    group.setAttribute("id", "object_" + obj.id);
    group.setAttribute(
        "transform",
        `translate(${obj.x},${obj.y})`
    );

    // 4つの菱形
    const offsets = [
        [0, -10],
        [10, 0],
        [-10, 0],
        [0, 10]
    ];

    offsets.forEach(function(point) {

        const x = point[0];
        const y = point[1];

        const cell = document.createElementNS(NS, "polygon");

        cell.setAttribute(
            "points",
            `${x},${y-10} ${x+10},${y} ${x},${y+10} ${x-10},${y}`
        );

        cell.setAttribute("fill", obj.color);
        cell.setAttribute("stroke", "#333333");

        group.appendChild(cell);
    });

    // 文字
    const text = document.createElementNS(NS, "text");

    text.setAttribute("x", 0);
    text.setAttribute("y", 0);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", 12);

    text.textContent = obj.text;
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
            startPoint: point
        };

        svg.setPointerCapture(event.pointerId);
    });

    objectsLayer.appendChild(group);
}


// ドラッグ中
svg.addEventListener("pointermove", function(event) {

    if (!drag) return;

    const point = getSVGPoint(event);

    drag.obj.x = drag.startX
        + point.x - drag.startPoint.x;

    drag.obj.y = drag.startY
        + point.y - drag.startPoint.y;

    drag.group.setAttribute(
        "transform",
        `translate(${drag.obj.x},${drag.obj.y})`
    );
});


// ドラッグ終了・方眼補正
svg.addEventListener("pointerup", function(event) {

    if (!drag) return;

    let x = drag.obj.x;
    let y = drag.obj.y;

    // 方眼の2方向の座標
    let u = x + y;
    let v = x - y;

    // 最寄りの方眼交点へ補正
    u = Math.round(u / 20) * 20;
    v = Math.round(v / 20) * 20;

    drag.obj.x = (u + v) / 2;
    drag.obj.y = (u - v) / 2;

    drag.group.setAttribute(
        "transform",
        `translate(${drag.obj.x},${drag.obj.y})`
    );

    drag = null;
});


// 生成ボタン
const createButton = document.getElementById("create-object");

createButton.addEventListener("click", function() {

    const obj = {
        id: nextId,
        type: "2x2",
        x: 150,
        y: 150,
        text: "A",
        color: "#4da6ff"
    };

    objects.push(obj);
    nextId++;

    drawObject(obj);
});
