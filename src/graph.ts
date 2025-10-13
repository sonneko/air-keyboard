import Chart from 'chart.js/auto';

// 固定長配列の長さ (折れ線の本数)
const NUM_LINES = 20;
// グラフに表示するデータ点の最大数 (X軸の長さ)
const MAX_POINTS = 50;
// 更新間隔 (ミリ秒) - main.tsから呼び出すため、ここでは使用しない
// const UPDATE_INTERVAL = 100; 

// --- グラフデータを初期化 ---
const labels: number[] = []; // X軸のラベル（時刻やカウンターなど）
const datasets = [];

for (let i = 0; i < NUM_LINES; i++) {
    // 20本の折れ線（データセット）を初期化
    datasets.push({
        label: `ライン ${i + 1}`,
        data: Array(MAX_POINTS).fill(0), // MAX_POINTS分の0で初期化
        borderColor: getRandomColor(i), // 各ラインに異なる色を設定
        fill: false,
        tension: 0.1
    });
}

// ダミーの色生成関数（実際には適切な色セットを使ってください）
function getRandomColor(seed: number): string {
    const colors = [
        'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(75, 192, 192)', 'rgb(255, 159, 64)',
        'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgb(255, 205, 86)',
        'rgb(100, 100, 100)', 'rgb(200, 0, 0)', 'rgb(0, 200, 0)', 'rgb(0, 0, 200)',
        'rgb(200, 200, 0)', 'rgb(0, 200, 200)', 'rgb(200, 0, 200)', 'rgb(128, 128, 0)',
        'rgb(0, 128, 128)', 'rgb(128, 0, 128)', 'rgb(128, 0, 0)', 'rgb(0, 128, 0)',
        'rgb(0, 0, 128)'
    ];
    return colors[seed % colors.length];
}

// --- Chart.jsのインスタンスを作成 ---
const ctx = document.getElementById('graph') as HTMLCanvasElement;
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: datasets
    },
    options: {
        animation: false, // リアルタイム更新ではアニメーションをオフにするとパフォーマンスが向上
        scales: {
            y: { beginAtZero: true}
        },
        plugins: {
            legend: {
                display: false // 凡例を非表示にする
            }
        }
    }
});

let counter = 0;

export function updateChart(newDataRow: number[]) {
    // 1. リアルタイムで取得された新しいデータ（固定長配列: 長さ20）
    // 実際のアプリケーションでは、ここでセンサーデータなどを取得します。
    // const newDataRow: number[] = getNewFixedArrayData(); 

    // 2. X軸ラベル（時刻など）の更新
    labels.push(counter++);
    if (labels.length > MAX_POINTS) {
        labels.shift(); // 古いラベルを削除
    }

    // 3. 各データセット（折れ線）の更新
    for (let i = 0; i < NUM_LINES; i++) {
        const dataset = chart.data.datasets[i].data as number[]; // 'as number[]'で型アサーション

        // 新しいデータ点を追加
        dataset.push(newDataRow[i]);

        if (dataset.length > MAX_POINTS) {
            dataset.shift(); // 古いデータ点を削除（固定長を維持）
        }
    }

    // 4. グラフを再描画
    chart.update();
}

// --- ダミーデータ生成関数（長さ20の配列を返す）は不要になるため削除 --- 
// function getNewFixedArrayData(): number[] {
//     const data: number[] = [];
//     for (let i = 0; i < NUM_LINES; i++) {
//         // 例: i番目のデータセットは sin(時間/10) + ランダムノイズ の値を持つ
//         data.push(Math.sin(counter / 10 + i * 0.5) * 10 + Math.random() * 5);
//     }
//     return data;
// }

// 5. タイマーを設定して定期的に更新はmain.tsで行う
// setInterval(updateChart, UPDATE_INTERVAL);