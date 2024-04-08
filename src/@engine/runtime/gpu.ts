// import { Option, Result } from "@engine/stdlib";

// namespace WebGPU {
//     const gpu = navigator.gpu;

//     let vertex_buffers: GPUVertexBufferLayout[] = [];
//     let shader: GPUShaderModule;
//     let adapter: GPUAdapter;
//     let device: GPUDevice;
//     let canvas_ctx: GPUCanvasContext;

//     export async function Initalise(Canvas: HTMLCanvasElement): Promise<Option<Error>> {
//         if (!gpu) {
//             return new Error("Gpu isn't available!");
//         }

//         let adptr = await gpu.requestAdapter();
//         if (!adptr) {
//             return new Error("No GPU adapter found!");
//         }

//         adapter = adptr;
//         device = await adapter.requestDevice();

//         canvas_ctx = Canvas.getContext("webgpu")!;

//         canvas_ctx.configure({
//             device: device,
//             format: gpu.getPreferredCanvasFormat(),
//             alphaMode: "premultiplied",
//         });
//     }

//     export function UseShader(Shader: string) {
//         if (!device) return;
//         shader = device.createShaderModule({ code: Shader });
//     }

//     export function SetVertexBuffers(To: GPUVertexBufferLayout[]) {
//         vertex_buffers = To;
//     }
// }

// export default WebGPU;

// Define types for rendering configuration
export namespace WebGPURenderer {
    export interface RendererOptions {
        clearColor: GPUColorDict;
    }

    // GPU Color dictionary type
    export interface GPUColorDict {
        r: number;
        g: number;
        b: number;
        a: number;
    }

    let canvas: HTMLCanvasElement;
    let device: GPUDevice;
    let context: GPUCanvasContext;

    export async function init(canvasElement: HTMLCanvasElement) {
        canvas = canvasElement;

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("WebGPU is not supported on this device");
        }

        device = await adapter.requestDevice();
        context = canvas.getContext("webgpu") as GPUCanvasContext;

        context.configure({
            device: device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: "premultiplied",
        });

        if (!context) {
            throw new Error("WebGPU context not available");
        }
    }

    export function render(clearColor: GPUColorDict) {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: clearColor,
                    storeOp: "store",
                    loadOp: "clear",
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    export function start(canvasElement: HTMLCanvasElement, options: RendererOptions) {
        init(canvasElement)
            .then(() => {
                const renderLoop = () => {
                    render(options.clearColor);
                    requestAnimationFrame(renderLoop);
                };
                requestAnimationFrame(renderLoop);
            })
            .catch((error) => {
                console.error("Failed to initialize WebGPU:", error);
            });
    }
}
