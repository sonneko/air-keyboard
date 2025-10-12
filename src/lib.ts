type Vec = {
    x: number,
    y: number,
    z: number,
}

export function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function add(a: Vec, b: Vec): Vec {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    }
}

export function ne(a: Vec): Vec {
    return {
        x: -a.x,
        y: -a.y,
        z: -a.z,
    }
}

export function getDeg(x: Vec, y: Vec, base: Vec): number {
    const a = add(x, ne(base));
    const b = add(y, ne(base));
    const cosValue =  dot(a, b) / (scale(a) * scale(b));
    return Math.acos(cosValue);
}

export function scale(a: Vec): number {
    return Math.sqrt(a.x**2 + a.y**2 + a.z**2);
}