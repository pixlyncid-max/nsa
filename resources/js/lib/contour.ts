interface Point {
    x: number;
    y: number;
}

const round = (n: number) => n.toFixed(1);

/** Catmull-Rom tertutup diubah menjadi kurva Bezier yang halus. */
function closedSmoothPath(points: Point[]): string {
    const count = points.length;
    let d = `M${round(points[0].x)} ${round(points[0].y)}`;

    for (let i = 0; i < count; i++) {
        const p0 = points[(i - 1 + count) % count];
        const p1 = points[i];
        const p2 = points[(i + 1) % count];
        const p3 = points[(i + 2) % count];

        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2.x)} ${round(p2.y)}`;
    }

    return `${d}Z`;
}

interface ContourOptions {
    rings?: number;
    seed?: number;
    width?: number;
    height?: number;
}

export function contourPaths({
    rings = 10,
    seed = 1,
    width = 800,
    height = 600,
}: ContourOptions = {}): string[] {
    const cx = width * 0.62;
    const cy = height * 0.45;
    const pointsPerRing = 14;
    const paths: string[] = [];

    for (let ring = 1; ring <= rings; ring++) {
        const base = 36 + ring * 34;
        const points: Point[] = [];

        for (let k = 0; k < pointsPerRing; k++) {
            const angle = (Math.PI * 2 * k) / pointsPerRing;
            const wobble =
                1 +
                0.14 * Math.sin(2 * angle + seed) +
                0.09 * Math.sin(3 * angle + seed * 1.7 + ring * 0.15) +
                0.05 * Math.sin(5 * angle + seed * 2.3);
            const radius = base * wobble;

            points.push({
                x: cx + radius * Math.cos(angle) * 1.35,
                y: cy + radius * Math.sin(angle) * 0.9,
            });
        }

        paths.push(closedSmoothPath(points));
    }

    return paths;
}

/** Garis ombak horizontal berulang di dalam viewBox lebar `width`. */
export function wavePath(
    width = 1440,
    height = 24,
    amplitude = 6,
    period = 120
): string {
    const mid = height / 2;
    const half = period / 2;
    let d = `M0 ${mid} Q${half / 2} ${mid - amplitude} ${half} ${mid}`;

    for (let x = half * 2; x <= width + half; x += half) {
        d += ` T${x} ${mid}`;
    }

    return d;
}
