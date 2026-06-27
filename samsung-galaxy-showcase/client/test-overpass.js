async function test() {
  const query = `[out:json];node(50.7,7.1,50.8,7.25);out 10;`;
  
  console.log("Querying Private.coffee Overpass via POST...");
  
  try {
    const response = await fetch('https://overpass.private.coffee/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: `data=${encodeURIComponent(query)}`
    });
    
    console.log("Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Success! Found elements count:", data.elements?.length || 0);
    } else {
      console.log("Failed. Header text:", (await response.text()).slice(0, 100));
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
