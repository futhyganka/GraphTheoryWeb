// Khai báo toàn cục
var nodesDataFlow = new vis.DataSet([]);
var edgesDataFlow = new vis.DataSet([]);
var networkFlow = null;
var isDirectedFlow = true;
var nodesFlow = 0;
var edgesFlow = [];
const graphFlow = new FFGraph(nodesFlow);
var parentFlow = [];
var printFlow = document.getElementById('print-flow');

// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function() {
  
    // Lấy container
    const container = document.getElementById("my-graph-flow");

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
        const data = { nodes: nodesDataFlow, edges: edgesDataFlow };
        if (networkFlow) {
            networkFlow.destroy();
        }
        networkFlow = new vis.Network(container, data, options);
    }

    // Xử lý chế độ directed/undirected
    const directedFlow = document.getElementById('directed-flow');
    const undirectedFlow = document.getElementById('undirected-flow');

    if (directedFlow) {
        directedFlow.addEventListener('click', function() {
            isDirectedFlow = true;
            this.classList.add('active');
            undirectedFlow.classList.remove('active');
            options.edges.arrows = { to: { enabled: true } };
            updateNetwork();
        });
    }

    if (undirectedFlow) {
        undirectedFlow.addEventListener('click', function() {
            isDirectedFlow = false;
            this.classList.add('active');
            directedFlow.classList.remove('active');
            options.edges.arrows = { to: { enabled: false } };
            updateNetwork();
        });
    }

    // Nhập node
    var inputNodesFlow = document.getElementById("nodes-flow");
    if (inputNodesFlow) {
        inputNodesFlow.addEventListener('input', function(e) {
            nodesDataFlow.clear();
            edgesDataFlow.clear();
            
            nodesFlow = parseInt(e.target.value);

            graphFlow.initGraph(nodesFlow);
            parentFlow.length = 0;
            
            if (!isNaN(nodesFlow) && nodesFlow > 0) {
                for (var i = 1; i <= nodesFlow; i++) {
                    nodesDataFlow.add({ id: i, label: String(i) });
                }
                updateNetwork();
            }
        });
    }

    // Nhập edge
    var inputEdgesFlow = document.getElementById("edges-flow");
    if (inputEdgesFlow) {
        inputEdgesFlow.addEventListener('input', function(e) {
            edgesDataFlow.clear();
            
            edgesFlow = e.target.value
            .split(/\r?\n/).filter((line) => line.trim() !== "");

            graphFlow.initGraph(nodesFlow, isDirectedFlow);
            
            var edgeId = 1;
            for (var edgesLine of edgesFlow) {
                var edge = edgesLine.trim().split(/\s+/);
                var from = parseInt(edge[0]);
                var to = parseInt(edge[1]);
                var weight = edge[2] || "";
                var flow = edge[3] || "";
                
                if (!isNaN(from) && !isNaN(to)) {
                    edgesDataFlow.add({ 
                        id: edgeId++,
                        from: from, 
                        to: to,
                        label: weight + ( flow !== "" ? '/' : "") + flow,
                        arrows: isDirectedFlow ? { to: { enabled: true } } : { to: { enabled: false } }
                    });
                    graphFlow.addEdge(from, to, edge[2] || 1, edge[3] || 0);
                }
            }
            updateNetwork();
        });
    }

    // Khởi tạo network rỗng ban đầu
    updateNetwork();

});

var inputStartFlow = document.getElementById('start-flow');
var inputEndFlow = document.getElementById('end-flow');
var elementStartFlow = 0;
var elementEndFlow = 0;

inputStartFlow.oninput = function(e){
    elementStartFlow = parseInt(e.target.value);
}

inputEndFlow.oninput = function(e){
    elementEndFlow = parseInt(e.target.value);
}

var btnMatrixFlow = document.getElementById('matrix-flow');
var btncheckFlow = document.getElementById('check-flow');
var btnFlow = document.getElementById('btn-flow');

// matrix
btnMatrixFlow.onclick = function(e){
    printFlow.innerHTML = 'Matrix(Directed):' + 
    graphFlow.C.map(function(value, index){
        if(index === 0) return '';
        let temp = '';
        value.forEach(function(value, index){
            if(index > 0)
                temp += value == INF ? '0 ' : String(value) + ' '
        })
        return temp;
    }).join('<br>');
}

// kiểm tra luồng
btncheckFlow.onclick = function(e){
    if(!isDirectedFlow){
        printFlow.innerHTML = 'The flow network must be a directed graph!';
        return;
    }

    if(elementStartFlow < 1 || elementStartFlow > graphFlow.n){
        printFlow.innerHTML = 'Start data not found!';
        return;
    }

    if(elementEndFlow < 1 || elementEndFlow > graphFlow.n){
        printFlow.innerHTML = 'End data not found!';
        return;
    }

    let resultCheck = isValidFlowGraph(graphFlow, elementStartFlow, elementEndFlow);
    printFlow.innerHTML = resultCheck ? 'Flow Conservation!' : 'Flow Conservation Violation!';
}

btnFlow.onclick = function(e){
    if(!isDirectedFlow){
        printFlow.innerHTML = 'The flow network must be a directed graph!';
        return;
    }

    if(elementStartFlow < 1 || elementStartFlow > graphFlow.n){
        printFlow.innerHTML = 'Start data not found!';
        return;
    }

    if(elementEndFlow < 1 || elementEndFlow > graphFlow.n){
        printFlow.innerHTML = 'End data not found!';
        return;
    }
    
    const labels = Array.from({ length: graphFlow.n + 1 }, () => new FFLabel());
    const S = [];
    const T = [];
    let maxFlow = FordFulkerson(graphFlow, elementStartFlow, elementEndFlow, labels, S, T);

    // In ra kết quả
    printFlow.innerHTML = `
        Max Flow: ${maxFlow}<br><br>
        S: { ${S.join(", ")} }<br>
        T: { ${T.join(", ")} }
    `;

    // Tô màu node thuộc S và T
    // S → màu xanh
    // T → màu cam
    nodesDataFlow.forEach((node) => {
        if (S.includes(node.id)) {
            nodesDataFlow.update({
                id: node.id,
                color: { background: "#ffc4a0ff", border: "#ff9c5eff" }
            });
        } else if (T.includes(node.id)) {
            nodesDataFlow.update({
                id: node.id,
                color: { background: "#d6a8ffff", border: "#d572ffff" }
            });
        }
    });

    // Cập nhật lại số trên cung theo luồng mới
    edgesDataFlow.forEach((edge) => {
        const u = edge.from;
        const v = edge.to;

        const f = graphFlow.F[u][v];
        const c = graphFlow.C[u][v];

        edgesDataFlow.update({
            id: edge.id,
            label: `${f}/${c}`
        });
    });

    // Render lại sau khi update
    networkFlow.setData({ nodes: nodesDataFlow, edges: edgesDataFlow });
}