const http = require('http');

const resolveIcon = (name) => {
  return `[Icon: ${name}]`;
};

http.get('http://localhost:1431/api/catalog', (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log(`Successfully parsed JSON list with ${data.length} items.`);
      
      const parsedData = data.map((item, idx) => {
        console.log(`Processing item ${idx}: id=${item.id}, label=${item.label}`);
        const sections = typeof item.sections === 'string' ? JSON.parse(item.sections) : item.sections;
        
        if (!Array.isArray(sections)) {
          throw new Error(`sections is not an array for item: ${item.id}`);
        }
        
        const mappedSections = sections.map((sec, secIdx) => {
          if (sec.type === 'cards') {
            if (!sec.items || !Array.isArray(sec.items)) {
              throw new Error(`sec.items is not an array in section ${secIdx} for item: ${item.id}`);
            }
            return {
              ...sec,
              items: sec.items.map(card => ({
                ...card,
                icon: resolveIcon(card.icon)
              }))
            };
          }
          if (sec.type === 'tips') {
            if (!sec.items || !Array.isArray(sec.items)) {
              throw new Error(`sec.items is not an array in section ${secIdx} for item: ${item.id}`);
            }
            return {
              ...sec,
              items: sec.items.map(tip => ({
                ...tip,
                icon: resolveIcon(tip.icon)
              }))
            };
          }
          return sec;
        });
        
        return {
          ...item,
          sections: mappedSections,
          image: item.imageUrl,
          icon: resolveIcon(item.icon)
        };
      });
      
      console.log("All catalog items successfully parsed without errors!");
    } catch (err) {
      console.error("FAIL: Error parsing catalog data:", err.message);
    }
  });
}).on('error', (err) => {
  console.error("FAIL: Connection error:", err.message);
});
