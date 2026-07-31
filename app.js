import {
    pipeline,
    env
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";


// Browser-only model loading.
env.allowLocalModels = false;


// Small model for our first test.
const MODEL =
    "onnx-community/Qwen2.5-0.5B-Instruct-ONNX";


const chat =
    document.getElementById("chat");

const input =
    document.getElementById("message");

const send =
    document.getElementById("send");

const status =
    document.getElementById("status");


let ai = null;

let busy = false;


// Keep conversation context.
const conversation = [

    {
        role: "system",

        content:
            "You are HahaCatGPT, a friendly, " +
            "helpful conversational AI. " +
            "Answer the user's questions naturally " +
            "and clearly. Do not provide sexual " +
            "or adult content."
    }

];


// ============================
// LOAD AI
// ============================

async function loadAI() {

    try {

        status.textContent =
            "Downloading HahaCatGPT brain...";

        ai = await pipeline(
            "text-generation",
            MODEL,
            {
                dtype: "q4"
            }
        );


        status.textContent =
            "HahaCatGPT is ready!";


        input.disabled = false;

        send.disabled = false;

        input.focus();


    } catch (error) {

        console.error(error);

        status.textContent =
            "AI failed to load. Check console.";

    }
}


// ============================
// ADD MESSAGE
// ============================

function addMessage(
    text,
    type
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${type}`;


    const pfp =
        document.createElement("img");

    pfp.className =
        "pfp";

    pfp.src =
        type === "bot"
            ? "hahacat.jpg"
            : "hahacat.jpg";

    pfp.alt = "";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const name =
        document.createElement("div");

    name.className =
        "name";

    name.textContent =
        type === "bot"
            ? "HahaCatGPT"
            : "YOU";


    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble";

    bubble.textContent =
        text;


    content.appendChild(name);

    content.appendChild(bubble);

    wrapper.appendChild(pfp);

    wrapper.appendChild(content);

    chat.appendChild(wrapper);


    chat.scrollTop =
        chat.scrollHeight;


    return bubble;
}


// ============================
// THINKING MESSAGE
// ============================

function addTyping() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message bot";

    wrapper.id =
        "typing";


    const pfp =
        document.createElement("img");

    pfp.className =
        "pfp";

    pfp.src =
        "hahacat.jpg";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const text =
        document.createElement("div");

    text.className =
        "bubble typing";

    text.textContent =
        "HahaCatGPT is thinking...";


    content.appendChild(text);

    wrapper.appendChild(pfp);

    wrapper.appendChild(content);

    chat.appendChild(wrapper);


    chat.scrollTop =
        chat.scrollHeight;
}


// ============================
// SEND MESSAGE
// ============================

async function sendMessage() {

    if (
        !ai ||
        busy
    ) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    busy = true;

    send.disabled = true;

    input.disabled = true;


    addMessage(
        text,
        "user"
    );


    input.value = "";


    conversation.push({

        role: "user",

        content: text

    });


    addTyping();


    try {

        const result =
            await ai(
                conversation,
                {
                    max_new_tokens: 512,

                    temperature: 0.7,

                    do_sample: true,

                    return_full_text: false
                }
            );


        const typing =
            document.getElementById(
                "typing"
            );

        if (typing) {
            typing.remove();
        }


        let answer = "";


        if (
            result &&
            result[0]
        ) {

            const generated =
                result[0].generated_text;


            if (
                Array.isArray(
                    generated
                )
            ) {

                const last =
                    generated[
                        generated.length - 1
                    ];

                answer =
                    last?.content || "";

            } else {

                answer =
                    String(
                        generated || ""
                    );

            }

        }


        if (!answer.trim()) {

            answer =
                "I couldn't generate a reply.";

        }


        addMessage(
            answer.trim(),
            "bot"
        );


        conversation.push({

            role: "assistant",

            content: answer.trim()

        });


    } catch (error) {

        console.error(error);


        const typing =
            document.getElementById(
                "typing"
            );

        if (typing) {
            typing.remove();
        }


        addMessage(
            "Something went wrong while generating the reply.",
            "bot"
        );

    }


    busy = false;

    send.disabled = false;

    input.disabled = false;

    input.focus();

}


// ============================
// EVENTS
// ============================

send.addEventListener(
    "click",
    sendMessage
);


input.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// Start the brain.
loadAI();
