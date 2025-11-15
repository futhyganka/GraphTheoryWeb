// Khai báo toàn cục
var nodesDataCycle = new vis.DataSet([]);
var edgesDataCycle = new vis.DataSet([]);
var networkCycle = null;
var isDirectedCycle = true;
var nodesCycle = 0;
var edgesCycle = [];
const graphCycle = new Graph(nodesCycle, isDirectedCycle);
var parentCycle = [];
var printCycle = document.getElementById('print-cycle');

// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function() {
  
    // Lấy container
    const container = document.getElementById("my-graph-cycle");

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
        const data = { nodes: nodesDataCycle, edges: edgesDataCycle };
        if (networkCycle) {
            networkCycle.destroy();
        }
        networkCycle = new vis.Network(container, data, options);
    }

    // Xử lý chế độ directed/undirected
    const directedCycle = document.getElementById('directed-cycle');
    const undirectedCycle = document.getElementById('undirected-cycle');

    if (directedCycle) {
        directedCycle.addEventListener('click', function() {
            isDirectedCycle = true;
            this.classList.add('active');
            undirectedCycle.classList.remove('active');
            options.edges.arrows = { to: { enabled: true } };
            updateNetwork();
        });
    }

    if (undirectedCycle) {
        undirectedCycle.addEventListener('click', function() {
            isDirectedCycle = false;
            this.classList.add('active');
            directedCycle.classList.remove('active');
            options.edges.arrows = { to: { enabled: false } };
            updateNetwork();
        });
    }

    // Nhập node
    var inputNodesCycle = document.getElementById("nodes-cycle");
    if (inputNodesCycle) {
        inputNodesCycle.addEventListener('input', function(e) {
            nodesDataCycle.clear();
            edgesDataCycle.clear();
            
            nodesCycle = parseInt(e.target.value);

            graphCycle.initGraph(nodesCycle, isDirectedCycle);
            parentCycle.length = 0;
            
            if (!isNaN(nodesCycle) && nodesCycle > 0) {
                for (var i = 1; i <= nodesCycle; i++) {
                    nodesDataCycle.add({ id: i, label: String(i) });
                }
                updateNetwork();
            }
        });
    }

    // Nhập edge
    var inputEdgesCycle = document.getElementById("edges-cycle");
    if (inputEdgesCycle) {
        inputEdgesCycle.addEventListener('input', function(e) {
            edgesDataCycle.clear();
            
            edgesCycle = e.target.value
            .split(/\r?\n/).filter((line) => line.trim() !== "");

            graphCycle.initGraph(nodesCycle, isDirectedCycle);
            
            var edgeId = 1;
            for (var edgesLine of edgesCycle) {
                var edge = edgesLine.trim().split(/\s+/);
                var from = parseInt(edge[0]);
                var to = parseInt(edge[1]);
                var weight = edge[2] || "";
                
                if (!isNaN(from) && !isNaN(to)) {
                    edgesDataCycle.add({ 
                        id: edgeId++,
                        from: from, 
                        to: to,
                        label: weight,
                        arrows: isDirectedCycle ? { to: { enabled: true } } : { to: { enabled: false } }
                    });
                    graphCycle.addEdge(from, to, edge[2] || 1);
                }
            }
            updateNetwork();
        });
    }

    // Khởi tạo network rỗng ban đầu
    updateNetwork();

});

var inputStartCycle = document.getElementById('start-cycle');
var inputEndCycle = document.getElementById('end-cycle');
var elementStartCycle = 1;
var elementEndCycle = 1;

inputStartCycle.oninput = function(e){
    elementStartCycle = parseInt(e.target.value);
}

inputEndCycle.oninput = function(e){
    elementEndCycle = parseInt(e.target.value);
}

var btnMatrixCycle = document.getElementById('matrix-cycle');
var btnCycle = document.getElementById('check-cycle');
var btnConnectCycle = document.getElementById('connect-cycle');
var btnTarjanCycle = document.getElementById('tarjan-cycle');

// matrix
btnMatrixCycle.onclick = function(e){
    printCycle.innerHTML = 'Matrix:' + 
    graphCycle.adjMatrix.map(function(value, index){
        if(index === 0) return '';
        let temp = '';
        value.forEach(function(value, index){
            if(index > 0)
                temp += value == INF ? '0 ' : String(value) + ' '
        })
        return temp;
    }).join('<br>');
}

// cycle
btnCycle.onclick = async function (e) {
    const n = graphCycle.n; 
    if(n === 0){
        printCycle.innerText = 'Data not found!';
        return;
    }
    if(n < elementStartCycle){
        printCycle.innerText = 'Start data not found!';
        return;
    }
    const visited = Array(n + 1).fill(false);
    const recStack = Array(n + 1).fill(false);
    const parent = Array(n + 1).fill(-1);
    let cyclePath = [];
    let hasCycle = false;

    // Hàm đổi màu node
    async function colorNode(id, bg, border, delay = 800) {
        nodesDataCycle.update({
            id: id,
            color: { background: bg, border: border },
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Reset màu trước khi duyệt
    for (let i = 1; i <= n; i++) {
        nodesDataCycle.update({
            id: i,
            color: { background: "#ffc0cb", border: "#ff91a3" },
        });
    }

    // === DFS có hướng ===
    async function dfsDirected(u) {
        visited[u] = true;
        recStack[u] = true;
        await colorNode(u, "#e2b6f6ff", "#e791ffff"); // đang duyệt

        const neighbors = graphCycle.neighbors(u);
        for (let i = 1; i <= neighbors.size; i++) {
            const v = neighbors.elementAt(i);
            if (!visited[v]) {
                parent[v] = u;
                const found = await dfsDirected(v);
                if (found) return true;
            } else if (recStack[v]) {
                // Phát hiện chu trình
                hasCycle = true;
                cyclePath = [v];
                for (let x = u; x !== v && x !== -1; x = parent[x]) {
                    cyclePath.push(x);
                }
                cyclePath.push(v);
                cyclePath.reverse();

                // Highlight chu trình
                for (const node of cyclePath) {
                    await colorNode(node, "#ce7ff3ff", "#c022ecff", 500);
                }
                return true;
            }
        }

        recStack[u] = false;
        return false;
    }

    // === DFS vô hướng ===
    async function dfsUndirected(u, par) {
        visited[u] = true;
        await colorNode(u, "#e2b6f6ff", "#e791ffff");

        const neighbors = graphCycle.neighbors(u);
        for (let i = 1; i <= neighbors.size; i++) {
            const v = neighbors.elementAt(i);
            if (!visited[v]) {
                parent[v] = u;
                const found = await dfsUndirected(v, u);
                if (found) return true;
            } else if (v !== par) {
                // Phát hiện chu trình vô hướng
                hasCycle = true;
                cyclePath = [v];
                for (let x = u; x !== v && x !== -1; x = parent[x]) {
                    cyclePath.push(x);
                }
                cyclePath.push(v);
                cyclePath.reverse();

                for (const node of cyclePath) {
                    await colorNode(node, "#ce7ff3ff", "#c022ecff", 500);
                }
                return true;
            }
        }
        return false;
    }


    // Chạy kiểm tra
    if (graphCycle.isDirected) {
        await dfsDirected(elementStartCycle);
        for (let i = 1; i <= n && !hasCycle; i++) {
            if (!visited[i] && (await dfsDirected(i))) {
                hasCycle = true;
                break;
            }
        }
    } else {
        await dfsUndirected(elementStartCycle, -1);
        for (let i = 1; i <= n && !hasCycle; i++) {
            if (!visited[i] && (await dfsUndirected(i, -1))) {
                hasCycle = true;
                break;
            }
        }
    }

    // Hiển thị kết quả
    if (hasCycle) {
        printCycle.innerHTML =
            `Cyclic graph <br>` +
            `Cycle: ${cyclePath.join(" → ")}`;
    } else {
        printCycle.innerHTML =
            "Acyclic graph!";
    }
};

// connect
btnConnectCycle.onclick = function(e) {

    // Nếu đồ thị có hướng thì bỏ qua
    if (graphCycle.isDirected) {
        printCycle.innerHTML = 
            "Directed graph! <br>You can use Tarjan's algorithm.";
        return;
    }

    const n = graphCycle.n;
    // Nếu chưa có node nào thì thôi
    if (n === 0) {
        printCycle.innerHTML = "Data not found!";
        return;
    }

    // Reset màu trước khi duyệt
    for (let i = 1; i <= n; i++) {
        nodesDataCycle.update({
            id: i,
            color: { background: "#ffc0cb", border: "#ff91a3" },
        });
    }

    // duyệt qua bfs
    const visited = Array(n + 1).fill(-1);
    let connected = true;
    breadthFirstSearch(graphCycle, elementStartCycle, visited);
    
    for(let i = 1; i <= n && connected; i++){
        if(i !== elementStartCycle && visited[i] === -1){
            connected = false;
        }
    }

    printCycle.innerHTML = connected ? 'The graph is connected'
        : 'The graph is not connected'

};

btnTarjanCycle.onclick = function(e){
    
    // Nếu đồ thị vô hướng thì bỏ qua
    if (!graphCycle.isDirected) {
        printCycle.innerHTML = "Undirected graph!";
        return;
    }

    // Nếu chưa có node nào thì thôi
    if (graphCycle.n === 0) {
        printCycle.innerHTML = "Data not found!";
        return;
    }

    // Reset màu trước khi duyệt
    for (let i = 1; i <= graphCycle.n; i++) {
        nodesDataCycle.update({
            id: i,
            color: { background: "#ffc0cb", border: "#ff91a3" },
        });
    }

    let num = Array(MAX).fill(0);
    let minNum = Array(MAX).fill(0);
    let onStack = Array(MAX).fill(0);
    let S = new Stack();
    let SCCs = [];
    const kRef = { value: 1 };
    for (let i = 1; i <= graphCycle.n; i++) {
        if (num[i] === 0) scc(graphCycle, i, kRef, num, minNum, onStack, S, SCCs);
    }

    // In kết quả
    let result = SCCs.map((scc, idx) => 
        `SCC ${idx + 1}: ${scc.join(" - ")}`).join("<br>");
    printCycle.innerHTML = `Strongly Connected Components:<br>${result}`;

};
