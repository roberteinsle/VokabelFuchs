/**
 * Client-side Levenshtein distance for instant feedback preview.
 * Must match the server-side LevenshteinService logic.
 */
export function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

export function isAcceptable(input: string, target: string): boolean {
    const a = input.trim().toLowerCase();
    const b = target.trim().toLowerCase();

    if (a === b) return true;

    const targetLen = b.length;
    if (targetLen <= 3) return false;

    const maxDistance = Math.max(1, Math.floor(targetLen * 0.2));
    return levenshteinDistance(a, b) <= maxDistance;
}
