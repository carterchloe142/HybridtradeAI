async function main() {
  const res = await fetch('http://localhost:3000/api/i18n/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ locale: 'fr-FR', key: 'test.greeting', text: 'Hello, world' }),
  })

  const text = await res.text().catch(() => '')
  console.log(res.status)
  console.log(text)
}

main().catch((e) => {
  console.error(String(e?.message || e))
  process.exit(1)
})
