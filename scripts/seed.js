const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

console.log('Current CWD:', process.cwd())
const envPath = path.resolve(process.cwd(), '.env.local')
console.log('Resolved .env.local path:', envPath)
console.log('.env.local exists:', fs.existsSync(envPath))

const result = require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
if (result.error) {
    console.log('⚠️ Could not load .env.local, trying .env...')
    require('dotenv').config()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role for seeding

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'NOT SET')
console.log('Supabase Key:', supabaseKey && supabaseKey !== 'your_service_role_key' ? 'Set' : 'NOT SET (or placeholder)')

if (!supabaseUrl) {
    throw new Error("supabaseUrl is missing from environment variables. Please check .env.local")
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('🚀 Seeding data...')

    const testOrgs = [
        {
            name: 'Safe Net Health', users: [
                { email: 'admin@safenet.org', password: 'Password123!', role: 'admin', full_name: 'Sarah Admin' },
                { email: 'manager@safenet.org', password: 'Password123!', role: 'grant_manager', full_name: 'Mike Manager' }
            ]
        },
        {
            name: 'Community Care', users: [
                { email: 'director@community.org', password: 'Password123!', role: 'finance_director', full_name: 'David Director' },
                { email: 'coordinator@community.org', password: 'Password123!', role: 'grant_manager', full_name: 'Clara Coord' }
            ]
        }
    ]

    for (const orgData of testOrgs) {
        // 1. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({ name: orgData.name })
            .select()
            .single()

        if (orgError) {
            console.error(`Error creating org ${orgData.name}:`, orgError.message)
            continue
        }

        console.log(`✅ Created Org: ${org.name}`)

        for (const userData of orgData.users) {
            // 2. Create Auth User (Bypasses email confirmation)
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: { full_name: userData.full_name }
            })

            if (authError) {
                console.error(`Error creating auth user ${userData.email}:`, authError.message)
                continue
            }

            // 3. Create Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authUser.user.id,
                    organization_id: org.id,
                    full_name: userData.full_name,
                    role: userData.role
                })

            if (profileError) {
                console.error(`Error creating profile for ${userData.email}:`, profileError.message)
            } else {
                console.log(`   👤 Created User: ${userData.email} (${userData.role})`)
            }
        }
    }

    console.log('✨ Seeding complete!')
}

seed().catch(console.error)
