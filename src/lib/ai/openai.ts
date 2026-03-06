import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function matchGrant(grantDescription: string, organizationProfile: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are an expert grant consultant for healthcare nonprofits. Analyze the grant against the organization profile and provide a match score and rationale."
            },
            {
                role: "user",
                content: `Grant: ${grantDescription}\n\nOrganization: ${organizationProfile}`
            }
        ],
        response_format: { type: "json_object" }
    })

    return response.choices[0].message.content
}

export async function checkCompliance(grantRequirements: string, activityLog: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are an AI compliance officer. Review the grant requirements against the organization's activities and identify any gaps or upcoming deadlines."
            },
            {
                role: "user",
                content: `Requirements: ${grantRequirements}\n\nActivities: ${activityLog}`
            }
        ],
        response_format: { type: "json_object" }
    })

    return response.choices[0].message.content
}
