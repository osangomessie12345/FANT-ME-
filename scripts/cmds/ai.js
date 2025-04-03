const axios = require('axios');

const API_KEY = "AIzaSyBQeZVi4QdrnGKPEfXXx1tdIqlMM8iqvZw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const predefinedQuestions = {
  "qui t'a créé": "messie osango est mon créateur",
  "qui es-tu": "je suis l'intelligence artificielle créé par messie",
  "créateur": "mon créateur est messie osango",
  "qui est messie osango": "messie osango est le développeur hors norme qui m'a conçu"
};

async function getAIResponse(input, userName, userId, messageID) {
    try {
        const requestBody = {
            contents: [{
                parts: [{ text: input }]
            }]
        };

        const response = await axios.post(API_URL, requestBody, {
            headers: { "Content-Type": "application/json" }
        });

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text 
                    || "Désolé, je n'ai pas de réponse pour le moment.";
        return { response: reply, messageID };
    } catch (error) {
        console.error("Erreur API Gemini:", error.response?.data || error.message);
        return { response: "Une erreur est survenue avec l'IA. Veuillez réessayer plus tard.", messageID };
    }
}

module.exports = { 
    config: { 
        name: 'ai',
        author: 'messie osango',
        role: 0,
        category: 'ai',
        shortDescription: 'IA pour poser des questions',
    },
    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) return api.sendMessage("Veuillez poser votre question après la commande 'ai'.", event.threadID);

        try {
            const processedInput = input.toLowerCase().replace(/[.?¿!,]/g, '').trim();
            let response;

            if (processedInput === "ai") {
                response = "𝑆𝐴𝐿𝑈𝑇 𝐽𝐸 𝑆𝑈𝐼𝑆 𝐿'𝑖𝑛𝑡𝑒𝑙𝑙𝑖𝑔𝑒𝑛𝑐𝑒 𝐴𝑅𝑇𝐼𝐹𝐼𝐶𝐼𝐸𝐿𝐿𝐸 𝐶𝑅ÉÉ 𝑃𝐴𝑅 𝑀𝐸𝑆𝑆𝐼𝐸 𝑂𝑆𝐴𝑁𝐺𝑂 !";
            } else if (predefinedQuestions[processedInput]) {
                response = predefinedQuestions[processedInput];
            } else {
                const aiResponse = await getAIResponse(input, event.senderID, event.messageID);
                response = aiResponse.response;
            }

            api.sendMessage(
                `MESSIE OSANGO' \n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`,
                event.threadID,
                event.messageID
            );
        } catch (error) {
            api.sendMessage("❌ Une erreur s'est produite lors du traitement de votre demande.", event.threadID);
        }
    },
    onChat: async function ({ event, message }) {
        const messageContent = event.body.trim();
        if (!messageContent.toLowerCase().startsWith("ai")) return;

        try {
            const input = messageContent.slice(2).trim();
            if (!input) {
                return message.reply("𝑆𝐴𝐿𝑈𝑇 𝐽𝐸 𝑆𝑈𝐼𝑆 𝐿'𝑖𝑛𝑡𝑒𝑙𝑙𝑖𝑔𝑒𝑛𝑐𝑒 𝐴𝑅𝑇𝐼𝐹𝐼𝐶𝐼𝐸𝐿𝐿𝐸 𝐶𝑅ÉÉ 𝑃𝐴𝑅 𝑀𝐸𝑆𝑆𝐼𝐸 𝑂𝑆𝐴𝑁𝐺𝑂 !");
            }

            const processedInput = input.toLowerCase().replace(/[.?¿!,]/g, '').trim();
            const response = predefinedQuestions[processedInput] 
                || (await getAIResponse(input, event.senderID, event.messageID)).response;

            message.reply(
                `𝑆𝐴𝑇𝑂𝑅𝑈 𝐺𝑂𝐽𝑂  𝐵𝑂𝑇✫༒\n_______________________________\n${response}\n________________________`
            );
        } catch (error) {
            message.reply("❌ Désolé, je n'ai pas pu traiter votre demande.");
        }
    }
};
