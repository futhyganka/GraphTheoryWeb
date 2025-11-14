// ======================= HẰNG SỐ =======================
const MAX = 50;
const INF = 1000000;

// ======================= CẤU TRÚC CUNG =======================
class Edge {
    constructor(u, v, w = 1) {
        this.u = u;
        this.v = v;
        this.w = w;
    }
}

// ======================= CẤU TRÚC ĐỒ THỊ =======================
class Graph {
    constructor(n, isDirected = false) {
        this.n = n;
        this.isDirected = isDirected;
        this.adjMatrix = Array.from({ length: n + 1 }, () =>
            Array(n + 1).fill(INF)
        );
        this.edges = [];
    }

    initGraph(n, isDirected = false) {
        this.n = n;
        this.isDirected = isDirected;
        this.adjMatrix = Array.from({ length: n + 1 }, () =>
            Array(n + 1).fill(INF)
        );
        this.edges = [];
    }

    addEdge(u, v, w = 1) {
        if(this.adjMatrix[u][v] === INF){
            this.adjMatrix[u][v] = w;
            if (!this.isDirected) this.adjMatrix[v][u] = w;
        }else{
            this.adjMatrix[u][v] += w;
            if (!this.isDirected) this.adjMatrix[v][u] += w;
        }

        this.edges.push(new Edge(u, v, w));
        if (!this.isDirected) this.edges.push(new Edge(v, u, w));
    }

    neighbors(u) {
        const list = new List();
        for (let v = 1; v <= this.n; v++) {
            if (this.adjMatrix[u][v] !== 0 && this.adjMatrix[u][v] !== INF) {
                list.push(v);
            }
        }
        return list;
    }
}

// ======================= DANH SÁCH =======================
class List {
    constructor() {
        this.data = [];
        this.size = 0;
    }

    makeNull() {
        this.data = [];
        this.size = 0;
    }

    push(x) {
        this.data.push(x);
        this.size++;
    }

    elementAt(i) {
        return this.data[i - 1];
    }
}

// ======================= HÀNG ĐỢI =======================
class Queue {
    constructor() {
        this.data = [];
    }

    makeNull() {
        this.data = [];
    }

    push(x) {
        this.data.push(x);
    }

    top() {
        return this.data[0];
    }

    pop() {
        this.data.shift();
    }

    isEmpty() {
        return this.data.length === 0;
    }
}

// ======================= NGĂN XẾP =======================
class Stack {
    constructor() {
        this.data = [];
    }

    makeNull() {
        this.data = [];
    }

    push(x) {
        this.data.push(x);
    }

    top() {
        return this.data[this.data.length - 1];
    }

    pop() {
        this.data.pop();
    }

    isEmpty() {
        return this.data.length === 0;
    }
}

// ======================= BFS =======================
function breadthFirstSearch(G, start, parent) {
    const queue = new Queue();
    queue.makeNull();

    const mark = Array(MAX).fill(0);
    for (let i = 1; i <= G.n; i++) mark[i] = 0;

    queue.push(start);
    parent[start] = -1;

    const bfsList = new List();
    bfsList.makeNull();

    while (!queue.isEmpty()) {
        const u = queue.top();
        queue.pop();

        if (mark[u] === 1) continue;

        bfsList.push(u);
        mark[u] = 1;

        const neighbors = G.neighbors(u);
        for (let i = 1; i <= neighbors.size; i++) {
            const v = neighbors.elementAt(i);
            if (mark[v] === 0) {
                queue.push(v);
                if (parent[v] === -1) parent[v] = u;
            }
        }
    }

    return bfsList;
}

// ======================= DFS DÙNG STACK =======================
let mark = Array(MAX).fill(0);
let parent = Array(MAX).fill(-1);

function depthFirstSearch(G, start, parent) {
    const stack = new Stack();
    stack.push(start);
    parent[start] = -1;

    const dfsList = new List();
    dfsList.makeNull();

    for (let i = 1; i <= G.n; i++) mark[i] = 0;

    while (!stack.isEmpty()) {
        const u = stack.top();
        stack.pop();

        if (mark[u] === 1) continue;

        dfsList.push(u);
        mark[u] = 1;

        const neighbors = G.neighbors(u);
        for (let i = neighbors.size; i >= 1; i--) {
            const v = neighbors.elementAt(i);
            if (mark[v] === 0) {
                stack.push(v);
                if (parent[v] === -1) parent[v] = u;
            }
        }
    }

    return dfsList;
}

// ======================= DFS ĐỆ QUY =======================
function dfsRecursion(G, u, p, mark, parent) {
    if (mark[u] === 1) return;
    parent[u] = p;
    mark[u] = 1;

    const neighbors = G.neighbors(u);
    for (let i = 1; i <= neighbors.size; i++) {
        const v = neighbors.elementAt(i);
        dfsRecursion(G, v, u, mark, parent);
    }
}

// ======================= KIỂM TRA CHU TRÌNH =======================

// Kiểm tra chu trình trong đồ thị có hướng (DFS)
function hasCycleDirected(G) {
    const n = G.n;
    const visited = Array(n + 1).fill(0); // 0 = chưa thăm, 1 = đang thăm, 2 = đã xong

    function dfs(u) {
        visited[u] = 1; // đang thăm

        const neighbors = G.neighbors(u);
        for (let i = 1; i <= neighbors.size; i++) {
            const v = neighbors.elementAt(i);

            if (visited[v] === 1) return true; // phát hiện back-edge → có chu trình
            if (visited[v] === 0 && dfs(v)) return true;
        }

        visited[u] = 2; // kết thúc đỉnh
        return false;
    }

    for (let u = 1; u <= n; u++) {
        if (visited[u] === 0 && dfs(u)) return true;
    }

    return false;
}

// ======================= SCC (TARJAN) =======================

function scc(G, u, kRef, num, minNum, onStack, S, SCCs) {
    num[u] = kRef.value;
    minNum[u] = kRef.value;
    kRef.value++;
    S.push(u);
    onStack[u]++;

    const neighbors = G.neighbors(u);
    for (let i = 1; i <= neighbors.size; i++) {
        const v = neighbors.elementAt(i);
        if (num[v] === 0) {
            scc(G, v, kRef, num, minNum, onStack, S, SCCs);
            minNum[u] = Math.min(minNum[u], minNum[v]);
        } else if (onStack[v] !== 0) {
            minNum[u] = Math.min(minNum[u], num[v]);
        }
    }

    if (num[u] === minNum[u]) {
        let scc = [];
        let top;
        do {
            top = S.top();
            S.pop();
            onStack[top]--;
            scc.push(top);


        } while (top !== u);
        SCCs.push(scc);
    }
}

// ======================= MOORE-DIJKSTRA =======================
function mooreDijkstra(G, s, mark, pi, p) {

    pi[s] = 0;


    for (let i = 1; i < G.n; i++) {
        let u = -1;
        let minPi = INF;
        for (let j = 1; j <= G.n; j++) {
            if (mark[j] === 0 && pi[j] < minPi) {
                minPi = pi[j];
                u = j;
            }
        }

        if (u === -1) break;
        mark[u] = 1;

        for (let v = 1; v <= G.n; v++) {
            if (G.adjMatrix[u][v] !== INF && mark[v] === 0) {
                console.log(`${u} -> ${v}`);
                if (Number(pi[u]) + Number(G.adjMatrix[u][v]) < Number(pi[v])) {
                    pi[v] = Number(pi[u]) + Number(G.adjMatrix[u][v]);
                    p[v] = u;
                    console.log(`Visit node ${u}, pi ${v} = ${pi[u]}`);
                }
            }
        }
    }

}

// ======================= TOPO =======================

function topo(G) {
    let d = Array(MAX).fill(0);
    for (let u = 1; u <= G.n; u++) {
        d[u] = 0;
        for (let x = 1; x <= G.n; x++) {
            if (G.adjMatrix[x][u] !== INF) d[u]++;
        }
    }
    // console.log(d);
    const Q = new Queue();

    for (let i = 1; i <= G.n; i++) {
        if (d[i] === 0) Q.push(i);
    }

    const L = [];

    while (!Q.isEmpty()) {
        const u = Q.top();
        console.log(u);
        Q.pop();
        L.push(u);

        for (let v = 1; v <= G.n; v++) {
            if (G.adjMatrix[u][v] !== INF) {
                d[v]--;
                // console.log(v + '--');
                if (d[v] === 0) {
                    Q.push(v);
                    // console.log(v);
                }
            }
        }
        // console.log(d);
    }

    return L;
}

// ======================= KRUSKAL =======================
let parentK = Array(MAX).fill(0);

function findRoot(u) {
    while (u !== parentK[u]) u = parentK[u];
    return u;
}

function kruskal(G, F) {
    // Sắp xếp danh sách cạnh của G theo trọng số
    const sortedEdges = [...G.edges].sort((a, b) => a.w - b.w);

    // Khởi tạo đồ thị F rỗng có cùng số đỉnh
    F.initGraph(G.n, false);

    // Mỗi đỉnh là cha của chính nó
    for (let i = 1; i <= G.n; i++) parentK[i] = i;

    let sumW = 0;

    for (const { u, v, w } of sortedEdges) {
        const rootU = findRoot(u);
        const rootV = findRoot(v);
        if (rootU !== rootV) {
            F.addEdge(u, v, w);
            parentK[rootV] = rootU;
            sumW += Number(w);
        }
    }

    return sumW;
}

// ======================= PRIM =======================
let piPrim = Array(MAX).fill(0);
let pPrim = Array(MAX).fill(0);
let markPrim = Array(MAX).fill(0);

function prim(pG, pT, s) {
    for (let u = 1; u <= pG.n; u++) {
        piPrim[u] = INF;
        pPrim[u] = -1;
        markPrim[u] = 0;
    }
    piPrim[s] = 0;

    for (let i = 1; i <= pG.n; i++) {
        let minDist = INF;
        let u = -1;
        for (let x = 1; x <= pG.n; x++) {
            if (markPrim[x] === 0 && piPrim[x] < minDist) {
                minDist = piPrim[x];
                u = x;
            }
        }

        markPrim[u] = 1;

        for (let v = 1; v <= pG.n; v++) {
            if (pG.adjMatrix[u][v] !== 0 && pG.adjMatrix[u][v] !== INF) {
                if (markPrim[v] === 0 && piPrim[v] > pG.adjMatrix[u][v]) {
                    piPrim[v] = pG.adjMatrix[u][v];
                    pPrim[v] = u;
                }
            }
        }
    }

    pT.initGraph(pG.n, false);
    let sumW = 0;
    for (let u = 1; u <= pG.n; u++) {
        if (pPrim[u] !== -1) {
            const w = pG.adjMatrix[pPrim[u]][u];
            pT.addEdge(pPrim[u], u, w);
            sumW += Number(w);
        }
    }
    return sumW;
}

// ======================= Maximun Flow =======================
class FFLabel {
    constructor() {
        this.dir = 0; // +1 xuôi, -1 ngược, 0 chưa thăm
        this.p = 0; // đỉnh cha
        this.sigma = 0; // luồng khả dụng tối thiểu
    }
}

// Graph dùng cho Ford-Fulkerson (dùng ma trận công suất và luồng)
class FFGraph {
    constructor(n) {
        this.n = n;
        this.C = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0)); // công suất
        this.F = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0)); // luồng
    }

    addEdge(u, v, w, f = 0) {
        this.C[u][v] = w;
        this.F[u][v] = f;
    }

    initFlow() {
        for (let i = 1; i <= this.n; i++)
            for (let j = 1; j <= this.n; j++) {
                this.F[i][j] = 0;
            }
    }

    initGraph(n) {
        this.n = n;
        this.C = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0)); // công suất
        this.F = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0)); // luồng
    }
}

// Hàm tìm luồng tối đa
function FordFulkerson(G, s, t, labels, S, T) {
    G.initFlow();
    let max_flow = 0;

    const queue = new Queue();

    while(true) {
        for (let u = 1; u <= G.n; u++) labels[u].dir = 0;

        labels[s].dir = +1;
        labels[s].p = Number(s);
        labels[s].sigma = INF;

        queue.makeNull();
        queue.push(s);

        let found = false;

        while (!queue.isEmpty()) {
            const u = queue.top();
            queue.pop();

            // cung xuôi
            for (let v = 1; v <= G.n; v++) {
                if (G.C[u][v] != 0 && labels[v].dir == 0 && G.F[u][v] < G.C[u][v]) {
                    labels[v].dir = +1;
                    labels[v].p = Number(u);
                    labels[v].sigma = Math.min(labels[u].sigma, Number(G.C[u][v]) - Number(G.F[u][v]));
                    queue.push(v);
                }
            }

            // cung ngược
            for (let x = 1; x <= G.n; x++) {
                if (G.C[x][u] != 0 && labels[x].dir == 0 && G.F[x][u] > 0) {
                    labels[x].dir = -1;
                    labels[x].p = Number(u);
                    labels[x].sigma = Math.min(Number(labels[u].sigma), Number(G.F[x][u]));
                    queue.push(x);
                }
            }

            if (labels[t].dir !== 0) {
                found = true;
                break;
            }
        }

        if (found) {
            let sigma = labels[t].sigma;
            let u = t;
            while (u != s) {
                const p = labels[u].p;
                if (labels[u].dir > 0) G.F[p][u] += sigma;
                else G.F[p][u] -= sigma;
                u = p;
            }
            max_flow += sigma;
        } else {
            for(let i = 1; i <= G.n; i++){
                if(labels[i].dir == 0){
                    T.push(i)
                }else S.push(i);
            }
            break;
        }
    }

    return max_flow;
}

// ======================= KIỂM TRA LUỒNG HỢP LỆ =======================
function isValidFlowGraph(G, s, t) {
    const n = G.n;
    const inFlow = Array(n + 1).fill(0);
    const outFlow = Array(n + 1).fill(0);

    for (let u = 1; u <= n; u++) {
        for (let v = 1; v <= n; v++) {
            const f = Number(G.F[u][v]);
            const c = Number(G.C[u][v]);

            // 0 <= F[u][v] <= C[u][v]
            if (f < 0 || f > c) return false;

            outFlow[u] += f;
            inFlow[v] += f;
        }
    }

    console.log(inFlow);
    console.log(outFlow);
    // Tổng luồng ra từ nguồn phải bằng tổng luồng vào đích
    if (outFlow[s] !== inFlow[t]) return false;

    // Tại các đỉnh trung gian, tổng luồng vào phải bằng tổng luồng ra
    for (let u = 1; u <= n; u++) {
        if (u !== s && u !== t && inFlow[u] !== outFlow[u]) return false;
    }

    return true;
}
