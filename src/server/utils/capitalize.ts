export function capitalize<N extends string>(name: N): Capitalize<N> {
    return name.charAt(0).toUpperCase() + name.slice(1) as Capitalize<N>;
}
