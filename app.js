const input = document.getElementById("message");
const send = document.getElementById("send");
const chat = document.getElementById("chat");
const status = document.getElementById("status");

const conversation = [
    {
        role: "system",
        content:
            "You are HahaCatGPT, a friendly and helpful AI assistant. " +
            "Answer naturally and clearly."
    }
];

let busy = false;

function addMessage(text, type) {

    const wrapper = document.createElement("div");
    wrapper.className = `message ${type}`;

    const pfp = document.createElement("img");
    pfp.className = "pfp";
    pfp.src = "hahacat.jpg";

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent =
        type === "bot" ? "HahaCatGPT" : "YOU";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    content.appendChild(name);
    content.appendChild(bubble);

    wrapper.appendChild(pfp);
    wrapper.appendChild(content);

    chat.appendChild(wrapper);

    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {

    if (busy) return;

    const text = input.value.trim();

    if (!text) return;

    busy = true;

    send.disabled = true;
    input.disabled = true;

    addMessage(text, "user");

    input.value = "";

    conversation.push({
        role: "user",
        content: text
    });

    status.textContent = "HahaCatGPT is thinking...";

    try {

        const response = await fetch(
            "YOUR_BACKEND_URL/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    messages: conversation
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        addMessage(
            data.reply,
            "bot"
        );

        conversation.push({
            role: "assistant",
            content: data.reply
        });

        status.textContent =
            "HahaCatGPT is ready!";

    } catch (error) {

        console.error(error);

        addMessage(
            "Sorry, I couldn't connect to my brain.",
            "bot"
        );

        status.textContent =
            "Connection error.";

    }

    busy = false;

    send.disabled = false;
    input.disabled = false;

    input.focus();
}

send.addEventListener(
    "click",
    sendMessage
);

input.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            sendMessage();
        }
    }
);

status.textContent =
    "HahaCatGPT is ready!";
