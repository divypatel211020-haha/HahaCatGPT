import {
    pipeline,
    env
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";


// Don't try to use Node.js files.
env.allowLocalModels = false;


// Small browser-compatible text-generation model.
const model = "onnx-community/Qwen2.5-0.5B-Instruct-ONNX";


const status = document.getElementById("status");
const input = document.getElementById("message");
const send = document.getElementById("send");
const chat = document.getElementById("chat");


let generator = null;
let loading = false;


async function loadAI() {

    if (loading) return;

    loading = true;

    status.textContent =
        "Loading HahaCatGPT... This may take a while the first time.";

    try {

        generator = await pipeline(
            "text-generation",
            model,
            {
                dtype: "q4"
            }
        );

        status.textContent =
            "HahaCatGPT is ready.";

    } catch (error) {

        console.error(error);

        status.textContent =
            "Failed to load the AI.";

    } finally {

        loading = false;

    }
}


async function askAI(message) {

    if (!generator) {
        return "The AI is still loading.";
    }


    const prompt = [
        {
            role: "system",
            content:
                "You are HahaCatGPT, a helpful conversational AI. " +
                "Give clear, friendly answers. Do not provide sexual or adult content."
        },
        {
            role: "user",
            content: message
        }
    ];


    const result = await generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true
    });


    return result[0].generated_text.at(-1).content;
}


async function sendMessage() {

    const message =
        input.value.trim();

    if (!message) return;


    input.value = "";

    chat.textContent +=
        `You: ${message}\n`;


    send.disabled = true;

    status.textContent =
        "HahaCatGPT is thinking...";


    try {

        const answer =
            await askAI(message);

        chat.textContent +=
            `HahaCatGPT: ${answer}\n\n`;

    } catch (error) {

        console.error(error);

        chat.textContent +=
            "HahaCatGPT: Something went wrong.\n\n";

    }


    status.textContent =
        "HahaCatGPT is ready.";

    send.disabled = false;

    input.focus();
}


send.addEventListener(
    "click",
    sendMessage
);


input.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            sendMessage();
        }

    }
);


// Start loading the model.
loadAI();
