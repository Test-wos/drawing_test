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

// テスト用のマス
const cell = document.createElementNS(NS, "polygon");

cell.setAttribute("points", "150,140 160,150 150,160 140,150");
cell.setAttribute("fill", "white");
cell.setAttribute("stroke", "none");

svg.appendChild(cell);

// クリックしたら赤くする
cell.addEventListener("click", function() {
    cell.setAttribute("fill", "red");
});
