const { fetchTweets } = require('./dist/scraper.js');

async function testConcurrencyPerformance() {
  console.log('🏁 Test de performance : Mode séquentiel vs Mode concurrent\n');
  
  const username = 'PSG_inside';
  const maxPages = 3;
  
  try {
    // Test 1: Mode séquentiel
    console.log('📄 Test 1: Mode séquentiel');
    const startSequential = Date.now();
    
    const sequentialTweets = await fetchTweets(username, maxPages, false, undefined, false);
    
    const endSequential = Date.now();
    const sequentialTime = endSequential - startSequential;
    
    console.log(`✅ Mode séquentiel terminé`);
    console.log(`⏱️  Temps: ${sequentialTime}ms`);
    console.log(`📊 Tweets récupérés: ${sequentialTweets.length}\n`);
    
    // Attendre un peu entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Mode concurrent
    console.log('🚀 Test 2: Mode concurrent');
    const startConcurrent = Date.now();
    
    const concurrentTweets = await fetchTweets(username, maxPages, false, undefined, true);
    
    const endConcurrent = Date.now();
    const concurrentTime = endConcurrent - startConcurrent;
    
    console.log(`✅ Mode concurrent terminé`);
    console.log(`⏱️  Temps: ${concurrentTime}ms`);
    console.log(`📊 Tweets récupérés: ${concurrentTweets.length}\n`);
    
    // Comparaison des résultats
    console.log('📈 COMPARAISON DES PERFORMANCES:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Mode séquentiel:  ${sequentialTime}ms (${sequentialTweets.length} tweets)`);
    console.log(`Mode concurrent:  ${concurrentTime}ms (${concurrentTweets.length} tweets)`);
    
    if (concurrentTime < sequentialTime) {
      const improvement = ((sequentialTime - concurrentTime) / sequentialTime * 100).toFixed(1);
      console.log(`🎉 Amélioration: ${improvement}% plus rapide avec le mode concurrent!`);
      console.log(`⚡ Gain de temps: ${sequentialTime - concurrentTime}ms`);
    } else {
      console.log(`⚠️  Le mode séquentiel était plus rapide cette fois`);
    }
    
    // Vérification de la qualité des données
    console.log(`\n🔍 VÉRIFICATION DE LA QUALITÉ:`);
    const sequentialIds = new Set(sequentialTweets.map(t => t.id));
    const concurrentIds = new Set(concurrentTweets.map(t => t.id));
    
    const commonTweets = [...sequentialIds].filter(id => concurrentIds.has(id));
    const onlySequential = [...sequentialIds].filter(id => !concurrentIds.has(id));
    const onlyConcurrent = [...concurrentIds].filter(id => !sequentialIds.has(id));
    
    console.log(`🤝 Tweets communs: ${commonTweets.length}`);
    console.log(`📄 Uniquement séquentiel: ${onlySequential.length}`);
    console.log(`🚀 Uniquement concurrent: ${onlyConcurrent.length}`);
    
    if (onlySequential.length > 0) {
      console.log(`   IDs séquentiel uniquement: ${onlySequential.slice(0, 3).join(', ')}${onlySequential.length > 3 ? '...' : ''}`);
    }
    if (onlyConcurrent.length > 0) {
      console.log(`   IDs concurrent uniquement: ${onlyConcurrent.slice(0, 3).join(', ')}${onlyConcurrent.length > 3 ? '...' : ''}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testConcurrencyPerformance(); 