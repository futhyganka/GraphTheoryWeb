// Khai báo toàn cục
var nodesDataMST = new vis.DataSet([]);
var edgesDataMST = new vis.DataSet([]);
var networkMST = null;
var isDirectedMST = true;
var nodesMST = 0;
var edgesMST = [];
const graphMST = new Graph(nodesMST, isDirectedMST);
var parentMST = [];
var printMST = document.getElementById('print-mst');

// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function() {
  
    // Lấy container
    const container = document.getElementById("my-graph-mst");

    // Options cho network
    const options = {
        edges: {
            color: "#848484",
            width: 2,
            arrows: { to: { enabled: true } },//có hướng / vô hướng
            font: {
                size: 24,
                color: "#848484",
                // strokeWidth: 2,
                // strokeColor: "#ffffffff",
                align: "top",
            },
            smooth: { enabled: true, type: "dynamic" },
        },
        nodes: {
            shape: "circle",
            color: { 
                background: "#ffc0cb", 
                border: "#ff91a3", 
                highlight: { background: "#b6ddf6", border: "#91ceff" }
            },
            font: { 
                color: "#fff", 
                size: 24,
                vadjust: 2,
                face: "monospace",
                align: "center",
            },
            size: 60,
            labelHighlightBold: false,
        },
        physics: { 
            enabled: true,
            stabilization: { iterations: 100 }
        },
    };

    // Hàm render/update network
    function updateNetwork() {
        const data = { nodes: nodesDataMST, edges: edgesDataMST };
        if (networkMST) {
            networkMST.destroy();
        }
        networkMST = new vis.Network(container, data, options);
    }

    // Xử lý chế độ directed/undirected
    const directedMST = document.getElementById('directed-mst');
    const undirectedMST = document.getElementById('undirected-mst');

    if (directedMST) {
        directedMST.addEventListener('click', function() {
            isDirectedMST = true;
            this.classList.add('active');
            undirectedMST.classList.remove('active');
            options.edges.arrows = { to: { enabled: true } };
            updateNetwork();
        });
    }

    if (undirectedMST) {
        undirectedMST.addEventListener('click', function() {
            isDirectedMST = false;
            this.classList.add('active');
            directedMST.classList.remove('active');
            options.edges.arrows = { to: { enabled: false } };
            updateNetwork();
        });
    }

    // Nhập node
    var inputNodesMST = document.getElementById("nodes-mst");
    if (inputNodesMST) {
        inputNodesMST.addEventListener('input', function(e) {
            nodesDataMST.clear();
            edgesDataMST.clear();
            
            nodesMST = parseInt(e.target.value);

            graphMST.initGraph(nodesMST, isDirectedMST);
            parentMST.length = 0;
            
            if (!isNaN(nodesMST) && nodesMST > 0) {
                for (var i = 1; i <= nodesMST; i++) {
                    nodesDataMST.add({ id: i, label: String(i) });
                }
                updateNetwork();
            }
        });
    }

    // Nhập edge
    var inputEdgesMST = document.getElementById("edges-mst");
    if (inputEdgesMST) {
        inputEdgesMST.addEventListener('input', function(e) {
            edgesDataMST.clear();
            
            edgesMST = e.target.value
            .split(/\r?\n/).filter((line) => line.trim() !== "");

            graphMST.initGraph(nodesMST, isDirectedMST);
            
            var edgeId = 1;
            for (var edgesLine of edgesMST) {
                var edge = edgesLine.trim().split(/\s+/);
                var from = parseInt(edge[0]);
                var to = parseInt(edge[1]);
                var weight = edge[2] || "";
                
                if (!isNaN(from) && !isNaN(to)) {
                    edgesDataMST.add({ 
                        id: edgeId++,
                        from: from, 
                        to: to,
                        label: weight,
                        arrows: isDirectedMST ? { to: { enabled: true } } : { to: { enabled: false } }
                    });
                    graphMST.addEdge(from, to, edge[2] || 1);
                }
            }
            updateNetwork();
        });
    }

    // Khởi tạo network rỗng ban đầu
    updateNetwork();

});

var inputStartMST = document.getElementById('start-mst');
var inputEndMST = document.getElementById('end-mst');
var elementStartMST = 0;
var elementEndMST = 0;

inputStartMST.oninput = function(e){
    elementStartMST = parseInt(e.target.value);
}

inputEndMST.oninput = function(e){
    elementEndMST = parseInt(e.target.value);
}

var btnMatrixMST = document.getElementById('matrix-mst');
var btnKruskalMST = document.getElementById('kruskal-mst');
var btnPrimMST = document.getElementById('prim-mst');

// matrix
btnMatrixMST.onclick = function(e){
    printMST.innerHTML = 'Matrix:' + 
    graphMST.adjMatrix.map(function(value, index){
        if(index === 0) return '';
        let temp = '';
        value.forEach(function(value, index){
            if(index > 0)
                temp += value == INF ? '0 ' : String(value) + ' '
        })
        return temp;
    }).join('<br>');
}

btnKruskalMST.onclick = function (e) {

    // Nếu đồ thị có hướng thì bỏ qua
    if (graphMST.isDirected) {
        printMST.innerHTML = 
            "Directed graph!";
        return;
    }

    if (graphMST.n === 0 || graphMST.edges.length === 0) {
        printMST.innerHTML = "Data not found!";
        return;
    }

    // Tạo đồ thị F để chứa cây khung nhỏ nhất
    const graphF = new Graph(graphMST.n, false);

    // Gọi Kruskal
    const sumW = kruskal(graphMST, graphF);

    // In kết quả ra console + giao diện
    let resultHTML = `<b>Kruskal</b><br><br>Total weight: ${sumW}<br><br>`;
    resultHTML += "Edges in the Minimum Spanning Tree (MST):<br>";

    // Dùng Set để tránh in trùng ngược chiều
    const printedEdges = new Set();

    for (const { u, v, w } of graphF.edges) {
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (!printedEdges.has(key)) {
            printedEdges.add(key);
            resultHTML += `${u}  -  ${v}  (${w})<br>`;
        }
    }

    // Đổi màu trên đồ thị gốc
    edgesDataMST.forEach((edge) => {
        // Kiểm tra cạnh có nằm trong MST không
        const inMST = graphF.edges.some(
            (e) =>
                (e.u === edge.from && e.v === edge.to) ||
                (e.u === edge.to && e.v === edge.from)
        );

        if (inMST) {
            edgesDataMST.update({
                id: edge.id,
                color: { color: "#494949" },
                width: 3,
                font: {
                    color: "#494949",
                    align: "top",
            },
            });
        } else {
            edgesDataMST.update({
                id: edge.id,
                color: { color: "#8484849a" },
                width: 1,
            });
        }
    });

    printMST.innerHTML = resultHTML;
};

btnPrimMST.onclick = function (e) {
    // Nếu đồ thị có hướng thì bỏ qua
    if (graphMST.isDirected) {
        printMST.innerHTML = 
            "Directed graph!";
        return;
    }

    if(elementStartMST < 1 || elementStartMST > graphMST.n){
        printMST.innerHTML = "Start data not found!";
        return;
    }

    if (graphMST.n === 0 || graphMST.edges.length === 0) {
        printMST.innerHTML = "Data not found!";
        return;
    }

    // Tạo đồ thị F để chứa MST
    const graphF = new Graph(graphMST.n, false); // vô hướng khi tính MST

    // Chọn đỉnh bắt đầu (nếu chưa nhập thì mặc định là 1)
    const start = elementStartMST > 0 ? elementStartMST : 1;

    // Chạy Prim
    const sumW = prim(graphMST, graphF, start);

    // In kết quả
    let resultHTML = `<b>Prim</b><br><br>Total weight: ${sumW}<br><br>`;
    resultHTML += "Edges in the Minimum Spanning Tree (MST):<br>";

    // Dùng Set để tránh in trùng ngược chiều
    const printedEdges = new Set();
    for (const { u, v, w } of graphF.edges) {
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (!printedEdges.has(key)) {
            printedEdges.add(key);
            resultHTML += `${u}  -  ${v}  (${w})<br>`;
        }
    }

    // Đổi màu trên đồ thị gốc
    edgesDataMST.forEach((edge) => {
        // Kiểm tra cạnh có nằm trong MST không
        const inMST = graphF.edges.some(
            (e) =>
                (e.u === edge.from && e.v === edge.to) ||
                (e.u === edge.to && e.v === edge.from)
        );

        if (inMST) {
            edgesDataMST.update({
                id: edge.id,
                color: { color: "#494949" },
                width: 3,
                font: {
                    color: "#494949",
                    align: "top",
            },
            });
        } else {
            edgesDataMST.update({
                id: edge.id,
                color: { color: "#8484849a" },
                width: 1,
            });
        }
    });

    printMST.innerHTML = resultHTML;
};
