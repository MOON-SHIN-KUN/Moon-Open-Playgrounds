export default async function handler(req, res) {
    // Allow requests from your GitHub Pages site
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://moon-shin-kun.github.io"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // Handle browser CORS check
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only accept POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const {
            name,
            title,
            platform,
            browser,
            description,
            steps,
            severity
        } = req.body;

        // Basic validation
        if (!title || !description || !steps || !severity) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const webhook = process.env.DISCORD_WEBHOOK_URL;

        if (!webhook) {
            console.error("DISCORD_WEBHOOK_URL is missing");

            return res.status(500).json({
                error: "Server configuration error"
            });
        }

        // Send report to Discord
        const discordResponse = await fetch(webhook, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "Moon's Bug Reporter",
                embeds: [
                    {
                        title: "🐛 NEW BUG REPORT",
                        description: `**${title}**`,
                        fields: [
                            {
                                name: "👤 Reporter",
                                value: name || "Anonymous",
                                inline: true
                            },
                            {
                                name: "📱 Platform",
                                value: platform || "Not specified",
                                inline: true
                            },
                            {
                                name: "🌐 Browser",
                                value: browser || "Not specified",
                                inline: true
                            },
                            {
                                name: "⚠️ Severity",
                                value: severity,
                                inline: true
                            },
                            {
                                name: "📝 Description",
                                value: description.slice(0, 1000)
                            },
                            {
                                name: "🔁 Steps to Reproduce",
                                value: steps.slice(0, 1000)
                            }
                        ],
                        footer: {
                            text: "Moon's Open Playground • Bug Report"
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            })
        });

        if (!discordResponse.ok) {
            console.error(
                "Discord returned:",
                discordResponse.status
            );

            return res.status(502).json({
                error: "Could not send report to Discord"
            });
        }

        return res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
                                          }
