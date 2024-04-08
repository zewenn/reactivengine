// import WebGPU from "@engine/runtime/gpu";

export default /* wgsl */ `
@vertex fn vs (@builtin(vertex_index) i : u32) -> @builtin(position) vec4f {
    return vec4(0);
}

@fragment fn fs() -> @location(0) vec4<f32> {
    return vec4(0);
}
`;

// WebGPU.UseShader(shaders);
