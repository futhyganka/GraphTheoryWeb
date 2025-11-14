// Khai báo toàn cục
var nodesDataPath = new vis.DataSet([]);
var edgesDataPath = new vis.DataSet([]);
var networkPath = null;
var isDirectedPath = true;
var nodesPath = 0;
var edgesPath = [];
const graphPath = new Graph(nodesPath, isDirectedPath);
var parentPath = [];
var printPath = document.getElementById('print-path');

// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function() {
  
    // Lấy container
    const container = document.getElementById("my-graph-path");

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
        const data = { nodes: nodesDataPath, edges: edgesDataPath };
        if (networkPath) {
            networkPath.destroy();
        }
        networkPath = new vis.Network(container, data, options);
    }

    // Xử lý chế độ directed/undirected
    const directedPath = document.getElementById('directed-path');
    const undirectedPath = document.getElementById('undirected-path');

    if (directedPath) {
        directedPath.addEventListener('click', function() {
            isDirectedPath = true;
            this.classList.add('active');
            undirectedPath.classList.remove('active');
            options.edges.arrows = { to: { enabled: true } };
            updateNetwork();
        });
    }

    if (undirectedPath) {
        undirectedPath.addEventListener('click', function() {
            isDirectedPath = false;
            this.classList.add('active');
            directedPath.classList.remove('active');
            options.edges.arrows = { to: { enabled: false } };
            updateNetwork();
        });
    }

    // Nhập node
    var inputNodesPath = document.getElementById("nodes-path");
    if (inputNodesPath) {
        inputNodesPath.addEventListener('input', function(e) {
            nodesDataPath.clear();
            edgesDataPath.clear();
            
            nodesPath = parseInt(e.target.value);

            graphPath.initGraph(nodesPath, isDirectedPath);
            parentPath.length = 0;
            
            if (!isNaN(nodesPath) && nodesPath > 0) {
                for (var i = 1; i <= nodesPath; i++) {
                    nodesDataPath.add({ id: i, label: String(i) });
                }
                updateNetwork();
            }
        });
    }

    // Nhập edge
    var inputEdgesPath = document.getElementById("edges-path");
    if (inputEdgesPath) {
        inputEdgesPath.addEventListener('input', function(e) {
            edgesDataPath.clear();
            
            edgesPath = e.target.value
            .split(/\r?\n/).filter((line) => line.trim() !== "");

            graphPath.initGraph(nodesPath, isDirectedPath);
            
            var edgeId = 1;
            for (var edgesLine of edgesPath) {
                var edge = edgesLine.trim().split(/\s+/);
                var from = parseInt(edge[0]);
                var to = parseInt(edge[1]);
                var weight = edge[2] || "";
                
                if (!isNaN(from) && !isNaN(to)) {
                    edgesDataPath.add({ 
                        id: edgeId++,
                        from: from, 
                        to: to,
                        label: weight,
                        arrows: isDirectedPath ? { to: { enabled: true } } : { to: { enabled: false } }
                    });
                    graphPath.addEdge(from, to, edge[2] || 1);
                }
            }
            updateNetwork();
        });
    }

    // Khởi tạo network rỗng ban đầu
    updateNetwork();

});

var inputStartPath = document.getElementById('start-path');
var inputEndPath = document.getElementById('end-path');
var elementStartPath = 0;
var elementEndPath = 0;

inputStartPath.oninput = function(e){
    elementStartPath = parseInt(e.target.value);
}

inputEndPath.oninput = function(e){
    elementEndPath = parseInt(e.target.value);
}

var btnMatrixPath = document.getElementById('matrix-path');
var btnMDPath = document.getElementById('md-path');
var btnTopoPath = document.getElementById('topo-path');

// matrix
btnMatrixPath.onclick = function(e){
    printPath.innerHTML = 'Matrix:' + 
    graphPath.adjMatrix.map(function(value, index){
        if(index === 0) return '';
        let temp = '';
        value.forEach(function(value, index){
            if(index > 0)
                temp += value == INF ? '0 ' : String(value) + ' '
        })
        return temp;
    }).join('<br>');
}

// moore dijkstra
btnMDPath.onclick = function(e){

    // Nếu đồ thị vô hướng thì bỏ qua
    if (!isDirectedCycle) {
        printPath.innerHTML = "Undirected graph!";
        return;
    }

    // Nếu chưa có node nào thì thôi
    if(graphPath.n === 0) {
        printPath.innerHTML = "Data not found!";
        return;
    }

    if(elementStartPath < 1 || elementStartPath > graphPath.n){
        printPath.innerHTML = 'Start data not found!';
        return;
    }

    // Reset màu trước khi duyệt
    for (let i = 1; i <= graphCycle.n; i++) {
        nodesDataCycle.update({
            id: i,
            color: { background: "#ffc0cb", border: "#ff91a3" },
        });
    }

    const mark = Array(MAX).fill(0);
    const pi = Array(MAX).fill(INF);
    const p = Array(MAX).fill(-1);
    mooreDijkstra(graphPath, elementStartPath, mark, pi, p);
        
    // In kết quả
    let output = "Moore Dijkstra's algorithm:<br>";
    for (let i = 1; i <= graphPath.n; i++) {
        output += `Node ${i}:  pi = ${pi[i] === INF ? "∞" : pi[i]},  p = ${p[i]}<br>`;
    }

    printPath.innerHTML = output;
};

// Topo
btnTopoPath.onclick = function(e){

    // Nếu đồ thị vô hướng thì bỏ qua
    if (!isDirectedCycle) {
        printPath.innerHTML = "Undirected graph. Topological sorting cannot be applied to the graph!";
        return;
    }

    // Kiểm tra chu trình
    if(hasCycleDirected(graphPath)){
        printPath.innerHTML = "Cyclic graph. Topological sorting cannot be applied to the graph!";
        return;
    }

    // giải thuật
    
    const listTopo = topo(graphPath);
    printPath.innerHTML = `Topological sorting:<br>${listTopo.join(" → ")}`;
}