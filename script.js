const svg = document.getElementById("drawing-area");

const NS = "http://www.w3.org/2000/svg";

for (let k = -300; k <= 600; k += 20) {

    // x + y = k の直線
    const line1 = document.createElementNS(NS, "line");

    line1.setAttribute("x1", 0);
    line1.setAttribute("y1", k);
    line1.setAttribute("x2", 300);
    line1.setAttribute("y2", k - 300);

    line1.setAttribute("stroke", "#cccccc");
    line1.setAttribute("stroke-width", 1);

    svg.appendChild(line1);


    // x - y = k の直線
    const line2 = document.createElementNS(NS, "line");

    line2.setAttribute("x1", 0);
    line2.setAttribute("y1", -k);
    line2.setAttribute("x2", 300);
    line2.setAttribute("y2", 300 - k);

    line2.setAttribute("stroke", "#cccccc");
    line2.setAttribute("stroke-width", 1);

    svg.appendChild(line2);
}

// 2×2オブジェクト生成
const createButton = document.getElementById("create-object");

createButton.addEventListener("click", function() {

    const object = document.createElementNS(NS, "g");

    // 4つの菱形の中心座標
    const centers = [
        [130, 130],
        [150, 120],
        [130, 150],
        [150, 150]
    ];

    centers.forEach(function(point) {

        const x = point[0];
        const y = point[1];

        const cell = document.createElementNS(NS, "polygon");

        cell.setAttribute(
            "points",
            `${x},${y-10} ${x+10},${y} ${x},${y+10} ${x-10},${y}`
        );

        cell.setAttribute("fill", "#4da6ff");
        cell.setAttribute("stroke", "#333333");

        object.appendChild(cell);
    });

    svg.appendChild(object);

});

