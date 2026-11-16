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


// オブジェクト管理用データ
const objects = [];
let nextId = 1;


// オブジェクトを描画する関数
function drawObject(obj) {

    const group = document.createElementNS(NS, "g");

    group.setAttribute("id", "object_" + obj.id);

    // オブジェクトの4つのセル
    const offsets = [
        [0, -10],
        [10, 0],
        [-10, 0],
        [0, 10]
    ];

    offsets.forEach(function(point) {

        const x = obj.x + point[0];
        const y = obj.y + point[1];

        const cell = document.createElementNS(NS, "polygon");

        cell.setAttribute(
            "points",
            `${x},${y-10} ${x+10},${y} ${x},${y+10} ${x-10},${y}`
        );

        cell.setAttribute("fill", obj.color);
        cell.setAttribute("stroke", "#333333");

        group.appendChild(cell);
    });

    // 文字を追加
    const text = document.createElementNS(NS, "text");

    text.setAttribute("x", obj.x);
    text.setAttribute("y", obj.y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "12");

    text.textContent = obj.text;

    group.appendChild(text);

    svg.appendChild(group);
}


// 生成ボタン
const createButton = document.getElementById("create-object");

createButton.addEventListener("click", function() {

    // データを登録
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

    // 登録したデータから描画
    drawObject(obj);

});