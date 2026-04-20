


export async function generateWorkflowFromAI(prompt: string, context: any) {
    const apiKey = "AIzaSyChDCs6reT-UV1bb3jrFp8KW0FiUNdBNJ0";

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `
Return ONLY valid JSON.

Existing Workflow:
${JSON.stringify(context)}

User Request:
${prompt}

Format:
{
  "nodes": [
    { "id": "1", "type": "start", "label": "Start" }
  ],
  "edges": [
    { "source": "1", "target": "2" }
  ]
}
                `,
                            },
                        ],
                    },
                ],
            }),
        }
    );

    const data = await response.json();

    console.log("🔥 FULL AI RESPONSE:", data);

    // ✅ SAFE TEXT EXTRACTION (IMPORTANT)
    let text = "";

    try {
        text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            data?.candidates?.[0]?.content?.parts?.[0];

        if (!text) throw new Error("Empty AI response");
    } catch (e) {
        throw new Error("AI response structure changed");
    }

    console.log("🔥 AI TEXT:", text);

    // ✅ CLEAN JSON SAFELY
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new Error("Invalid JSON format from AI");
    }

    const cleanText = text.substring(start, end + 1);

    console.log("🔥 CLEAN JSON:", cleanText);

    try {
        return JSON.parse(cleanText);
    } catch (err) {
        console.error("JSON PARSE ERROR:", cleanText);
        throw new Error("AI returned invalid JSON");
    }
}