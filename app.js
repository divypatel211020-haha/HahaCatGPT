import {
    pipeline,
    env
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";


env.allowLocalModels = false;


const MODEL =
    "onnx-community/Qwen2.5-0.5B-Instruct-ONNX";


const input =
    document.getElementById("message");

const send =
    document.getElementById("send");

const chat =
    document.getElementById("chat");

const status =
    document.getElementById("status");


let ai = null;

let busy = false;


const conversation = [

    {
        role: "system",

        content:
            "You are HahaCatGPT, a friendly, " +
            "helpful conversational AI. " +
            "Answer naturally and clearly. " +
            "Do not provide sexual or adult content."
    }

];


// =================================
// AI LOADING
// =================================

async function loadAI() {

    try {

        status.textContent =
            "Downloading HahaCatGPT brain...";


        /*
         * IMPORTANT:
         * The text box stays enabled.
         * Only SEND is disabled until
         * the model is ready.
         */

        input.disabled = false;

        send.disabled = true;


        ai = await pipeline(
            "text-generation",
            MODEL,
            {
                dtype: "q4"
            }
        );


        status.textContent =
            "HahaCatGPT is ready!";


        send.disabled = false;

        input.focus();


    } catch (error) {

        console.error(error);

        status.textContent =
            "AI failed to load.";

        send.disabled = true;

    }
}


// =================================
// ADD MESSAGE
// =================================

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
        "hahacat.jpg";

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
}


// =================================
// TYPING INDICATOR
// =================================

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


    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble typing";

    bubble.textContent =
        "HahaCatGPT is thinking...";


    content.appendChild(bubble);

    wrapper.appendChild(pfp);

    wrapper.appendChild(content);

    chat.appendChild(wrapper);


    chat.scrollTop =
        chat.scrollHeight;
}


// =================================
// SEND
// =================================

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

    input.disabled = false;


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


        status.textContent =
            "HahaCatGPT is ready!";


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


        status.textContent =
            "Generation error.";
    }


    busy = false;

    send.disabled = false;

    input.disabled = false;

    input.focus();
}


// =================================
// EVENTS
// =================================

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


// =================================
// START
// =================================

input.disabled = false;

send.disabled = true;

status.textContent =
    "Starting HahaCatGPT...";


loadAI();
