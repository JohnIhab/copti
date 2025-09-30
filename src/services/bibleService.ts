import axios from 'axios';

const API_KEY = "8fb1094aa86c7d1a931deaabfa34809e";
// Expanded list of Arabic Bible translations to maximize API success
const ARABIC_BIBLE_IDS = [
  "b17e246951402e50-01", // Biblica® Open New Arabic Version 2012 (Primary)
  "88d7acc0ba6ec865-01", // Arabic Bible (Ketab El Hayat)
  "65eec8e0b60e656b-01", // Arabic Bible (Smith & Van Dyke)
  "de4e12af7f28f599-01", // Arabic Bible (Alternative)
  "f72b840c855f362c-04", // Arabic Bible (Traditional)
  "926aa5efbc5e04e2-01", // Arabic Bible (Modern)
  "eb5e32e66fec7af1-01"  // Arabic Bible (Contemporary)
];
let currentBibleIndex = 0;

export interface BibleVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterIds: string[];
  reference: string;
  content: string;
  verseCount: number;
  copyright: string;
}

export interface BibleApiResponse {
  data: BibleVerse;
  meta: {
    fums: string;
    fumsId: string;
    fumsJsInclude: string;
    fumsJs: string;
    fumsNoScript: string;
  };
}

// Extensive collection of verses for unlimited daily rotation
const biblicalVerses = [
  // John
  'JHN.1.1', 'JHN.1.12', 'JHN.1.14', 'JHN.3.16', 'JHN.3.17', 'JHN.8.12', 'JHN.10.10', 'JHN.11.25', 'JHN.14.1', 'JHN.14.6', 'JHN.14.27', 'JHN.15.5', 'JHN.16.33',
  // Psalms
  'PSA.1.1', 'PSA.23.1', 'PSA.23.4', 'PSA.27.1', 'PSA.34.8', 'PSA.37.4', 'PSA.46.1', 'PSA.46.10', 'PSA.91.1', 'PSA.91.2', 'PSA.100.4', 'PSA.103.8', 'PSA.118.24', 'PSA.119.105', 'PSA.121.1', 'PSA.139.14',
  // Romans
  'ROM.1.16', 'ROM.3.23', 'ROM.5.8', 'ROM.6.23', 'ROM.8.1', 'ROM.8.28', 'ROM.8.31', 'ROM.8.38', 'ROM.10.9', 'ROM.12.1', 'ROM.12.2',
  // Matthew
  'MAT.5.3', 'MAT.5.4', 'MAT.5.14', 'MAT.5.16', 'MAT.6.9', 'MAT.6.26', 'MAT.6.33', 'MAT.7.7', 'MAT.11.28', 'MAT.16.24', 'MAT.19.26', 'MAT.28.19', 'MAT.28.20',
  // Philippians
  'PHP.1.6', 'PHP.2.13', 'PHP.4.4', 'PHP.4.6', 'PHP.4.7', 'PHP.4.13', 'PHP.4.19',
  // Isaiah
  'ISA.9.6', 'ISA.26.3', 'ISA.40.8', 'ISA.40.31', 'ISA.41.10', 'ISA.43.2', 'ISA.53.5', 'ISA.55.8', 'ISA.55.11',
  // Jeremiah
  'JER.1.5', 'JER.29.11', 'JER.31.3', 'JER.33.3',
  // Ephesians
  'EPH.1.3', 'EPH.2.8', 'EPH.2.10', 'EPH.3.20', 'EPH.4.32', 'EPH.6.10',
  // 1 Corinthians
  '1CO.10.13', '1CO.13.4', '1CO.13.7', '1CO.13.13', '1CO.15.57', '1CO.16.14',
  // 2 Corinthians
  '2CO.1.3', '2CO.4.16', '2CO.5.7', '2CO.5.17', '2CO.9.8', '2CO.12.9',
  // Galatians
  'GAL.2.20', 'GAL.5.22', 'GAL.6.9',
  // Colossians
  'COL.1.27', 'COL.3.2', 'COL.3.12', 'COL.3.15', 'COL.3.17', 'COL.3.23',
  // 1 Peter
  '1PE.1.3', '1PE.2.9', '1PE.3.15', '1PE.4.10', '1PE.5.7',
  // James
  'JAS.1.2', 'JAS.1.5', 'JAS.1.17', 'JAS.4.7', 'JAS.4.8',
  // 1 John
  '1JN.1.9', '1JN.3.1', '1JN.4.7', '1JN.4.8', '1JN.4.16', '1JN.4.19', '1JN.5.4',
  // Hebrews
  'HEB.4.16', 'HEB.11.1', 'HEB.11.6', 'HEB.12.1', 'HEB.13.5', 'HEB.13.8',
  // Proverbs
  'PRO.3.5', 'PRO.3.6', 'PRO.16.3', 'PRO.18.10', 'PRO.22.6', 'PRO.27.1', 'PRO.31.25',
  // 1 Timothy
  '1TI.1.15', '1TI.4.12', '1TI.6.6',
  // Joshua
  'JOS.1.9', 'JOS.24.15',
  // Deuteronomy
  'DEU.31.6', 'DEU.31.8',
  // Acts
  'ACT.1.8', 'ACT.16.31', 'ACT.20.24',
  // Mark
  'MRK.9.23', 'MRK.11.24', 'MRK.16.15',
  // Luke
  'LUK.1.37', 'LUK.6.31', 'LUK.9.23', 'LUK.12.31'
];

// Get today's date as a string for daily tracking
function getTodayDateString(): string {
  return new Date().toDateString();
}

// Get verse index for today based on date
function getTodayVerseIndex(): number {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return dayOfYear % biblicalVerses.length;
}

// Fallback verses in Arabic for offline mode
const fallbackVerses = [
  {
    content: '"لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ."',
    reference: 'يوحنا 3: 16'
  },
  {
    content: '"الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ."',
    reference: 'مزمور 23: 1'
  },
  {
    content: '"قَالَ لَهُ يَسُوعُ: أَنَا هُوَ الطَّرِيقُ وَالْحَقُّ وَالْحَيَاةُ. لَيْسَ أَحَدٌ يَأْتِي إِلَى الآبِ إِلاَّ بِي."',
    reference: 'يوحنا 14: 6'
  },
  {
    content: '"وَنَحْنُ نَعْلَمُ أَنَّ كُلَّ الأَشْيَاءِ تَعْمَلُ مَعًا لِلْخَيْرِ لِلَّذِينَ يُحِبُّونَ اللهَ، الَّذِينَ هُمْ مَدْعُوُّونَ حَسَبَ قَصْدِهِ."',
    reference: 'رومية 8: 28'
  },
  {
    content: '"أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي."',
    reference: 'فيلبي 4: 13'
  }
];

// Function to try fetching from different Arabic Bible IDs with multiple strategies
async function fetchFromArabicBible(verseId: string): Promise<BibleVerse | null> {
  // Try different verse ID formats if the original doesn't work
  const verseFormats = [verseId];
  
  // Add alternative formats for common verse references
  if (verseId.includes('.')) {
    const parts = verseId.split('.');
    if (parts.length === 3) {
      // Try with different formatting
      verseFormats.push(`${parts[0]}.${parts[1]}.${parts[2]}`);
      verseFormats.push(`${parts[0]}_${parts[1]}_${parts[2]}`);
    }
  }
  
  for (let formatIndex = 0; formatIndex < verseFormats.length; formatIndex++) {
    const currentVerseId = verseFormats[formatIndex];
    
    for (let i = 0; i < ARABIC_BIBLE_IDS.length; i++) {
      const bibleId = ARABIC_BIBLE_IDS[(currentBibleIndex + i) % ARABIC_BIBLE_IDS.length];
      try {
        console.log(`🔍 Trying Bible ID: ${bibleId} for verse: ${currentVerseId} (format ${formatIndex + 1}/${verseFormats.length})`);
        
        const response = await axios.get<BibleApiResponse>(
          `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${currentVerseId}`,
          {
            headers: { 
              "api-key": API_KEY,
              "Content-Type": "application/json"
            },
            timeout: 10000
          }
        );
        
        // Check if the response contains Arabic text
        const content = response.data.data.content;
        console.log(`📝 Response content: ${content.substring(0, 100)}...`);
        
        // More comprehensive Arabic text validation
        const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(content);
        const hasEnglish = /[a-zA-Z]/.test(content.replace(/<[^>]*>/g, '')); // Ignore HTML tags
        
        console.log(`🔤 Contains Arabic: ${hasArabic}, Contains English: ${hasEnglish}`);
        
        if (hasArabic) {
          // Accept if it has Arabic, even if it has some English (like verse numbers)
          console.log('✅ Found Arabic text in response - using this verse');
          currentBibleIndex = (currentBibleIndex + i) % ARABIC_BIBLE_IDS.length;
          return response.data.data;
        } else {
          console.log('❌ Response does not contain Arabic text, trying next option...');
        }
      } catch (error) {
        console.error(`❌ Error with Bible ID ${bibleId} for verse ${currentVerseId}:`, error);
        continue;
      }
    }
  }
  
  console.log('🚫 No Arabic Bible API worked for any format, will use fallback');
  return null;
}

export async function getDailyVerse(): Promise<BibleVerse | null> {
  try {
    const today = getTodayDateString();
    const storedDate = localStorage.getItem('dailyVerseDate');
    const storedVerse = localStorage.getItem('dailyVerse');
    
    // Check if cached verse is in Arabic
    if (storedDate === today && storedVerse) {
      const cachedVerse = JSON.parse(storedVerse);
      const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(cachedVerse.content);
      const hasEnglish = /[a-zA-Z]/.test(cachedVerse.content);
      
      if (hasArabic && !hasEnglish) {
        console.log('✅ Using cached Arabic verse');
        return cachedVerse;
      } else {
        console.log('❌ Cached verse is not Arabic, clearing cache and fetching new one');
        clearVerseCache();
      }
    }
    
    // Get today's verse index
    const verseIndex = getTodayVerseIndex();
    const selectedVerse = biblicalVerses[verseIndex];
    
    console.log(`🎯 Fetching daily verse: ${selectedVerse} (index: ${verseIndex})`);
    
    // Try to fetch from Arabic Bible APIs
    const verse = await fetchFromArabicBible(selectedVerse);
    
    if (verse) {
      console.log('✅ Successfully fetched Arabic verse from API');
      // Cache today's verse
      localStorage.setItem('dailyVerseDate', today);
      localStorage.setItem('dailyVerse', JSON.stringify(verse));
      return verse;
    } else {
      // Use fallback Arabic verse
      console.log('📚 Using fallback Arabic verse');
      const fallbackIndex = verseIndex % fallbackVerses.length;
      const fallback = fallbackVerses[fallbackIndex];
      
      const fallbackVerse: BibleVerse = {
        id: `fallback-daily-${fallbackIndex}`,
        orgId: 'fallback',
        bookId: 'fallback',
        chapterIds: [],
        reference: fallback.reference,
        content: fallback.content,
        verseCount: 1,
        copyright: 'الكتاب المقدس'
      };
      
      // Cache the fallback verse too
      localStorage.setItem('dailyVerseDate', today);
      localStorage.setItem('dailyVerse', JSON.stringify(fallbackVerse));
      
      return fallbackVerse;
    }
  } catch (error) {
    console.error('❌ Error fetching daily Bible verse:', error);
    
    // Return fallback verse if everything fails
    const fallbackIndex = getTodayVerseIndex() % fallbackVerses.length;
    const fallback = fallbackVerses[fallbackIndex];
    
    return {
      id: `fallback-error-${fallbackIndex}`,
      orgId: 'fallback',
      bookId: 'fallback',
      chapterIds: [],
      reference: fallback.reference,
      content: fallback.content,
      verseCount: 1,
      copyright: 'الكتاب المقدس'
    };
  }
}

export async function getRandomVerse(): Promise<BibleVerse | null> {
  try {
    const randomIndex = Math.floor(Math.random() * biblicalVerses.length);
    const selectedVerse = biblicalVerses[randomIndex];
    
    console.log(`🎲 Fetching random verse: ${selectedVerse} (index: ${randomIndex})`);
    
    // Try to fetch from Arabic Bible APIs
    const verse = await fetchFromArabicBible(selectedVerse);
    
    if (verse) {
      console.log('✅ Successfully fetched random Arabic verse from API');
      return verse;
    } else {
      // Use fallback Arabic verse
      console.log('📚 Using fallback Arabic verse for random');
      const fallbackIndex = Math.floor(Math.random() * fallbackVerses.length);
      const fallback = fallbackVerses[fallbackIndex];
      
      return {
        id: `fallback-random-${fallbackIndex}`,
        orgId: 'fallback',
        bookId: 'fallback',
        chapterIds: [],
        reference: fallback.reference,
        content: fallback.content,
        verseCount: 1,
        copyright: 'الكتاب المقدس'
      };
    }
  } catch (error) {
    console.error('❌ Error fetching random Bible verse:', error);
    
    // Return random fallback verse if API fails
    const fallbackIndex = Math.floor(Math.random() * fallbackVerses.length);
    const fallback = fallbackVerses[fallbackIndex];
    
    return {
      id: `fallback-random-error-${fallbackIndex}`,
      orgId: 'fallback',
      bookId: 'fallback',
      chapterIds: [],
      reference: fallback.reference,
      content: fallback.content,
      verseCount: 1,
      copyright: 'الكتاب المقدس'
    };
  }
}

export async function getSpecificVerse(verseId: string): Promise<BibleVerse | null> {
  return await fetchFromArabicBible(verseId);
}

// Function to clear cache and force refresh (useful for testing)
export function clearVerseCache(): void {
  localStorage.removeItem('dailyVerseDate');
  localStorage.removeItem('dailyVerse');
  console.log('🧹 Verse cache cleared - will fetch fresh Arabic verses');
}

// Function to force clear any English verses from cache
export function forceArabicVersesOnly(): void {
  const storedVerse = localStorage.getItem('dailyVerse');
  
  if (storedVerse) {
    try {
      const verse = JSON.parse(storedVerse);
      const hasEnglish = /[a-zA-Z]/.test(verse.content);
      const isFromAPI = !verse.id.includes('fallback');
      
      if (hasEnglish || !isFromAPI) {
        console.log('🚫 Found non-API or English verse in cache, clearing it...');
        clearVerseCache();
      } else {
        console.log('✅ Cached verse is from API and in Arabic');
      }
    } catch (error) {
      console.log('⚠️ Error checking cached verse, clearing cache...');
      clearVerseCache();
    }
  }
}

// Force fetch from API with retries
export async function forceAPIVerse(verseId?: string): Promise<BibleVerse | null> {
  const targetVerse = verseId || biblicalVerses[Math.floor(Math.random() * biblicalVerses.length)];
  
  console.log(`🎯 Force fetching API verse: ${targetVerse}`);
  
  // Clear cache to force fresh fetch
  clearVerseCache();
  
  // Try multiple times with different strategies
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`🔄 Attempt ${attempt}/3 to fetch from API`);
    
    const verse = await fetchFromArabicBible(targetVerse);
    if (verse) {
      console.log('🎉 Successfully fetched verse from API!');
      return verse;
    }
    
    // Wait a bit before retrying
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('😞 Failed to fetch from API after all attempts');
  return null;
}

// Test all Arabic Bible APIs to find which ones work
export async function testAllArabicBibles(): Promise<void> {
  console.log('🧪 Testing all Arabic Bible APIs...');
  
  for (let i = 0; i < ARABIC_BIBLE_IDS.length; i++) {
    const bibleId = ARABIC_BIBLE_IDS[i];
    try {
      console.log(`\n📖 Testing Bible ID ${i + 1}/${ARABIC_BIBLE_IDS.length}: ${bibleId}`);
      
      const response = await axios.get<BibleApiResponse>(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/JHN.3.16`,
        {
          headers: { 
            "api-key": API_KEY,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );
      
      const content = response.data.data.content;
      const hasArabic = /[\u0600-\u06FF]/.test(content);
      
      console.log(`✅ Bible ID ${bibleId} works!`);
      console.log(`📝 Content: ${content.substring(0, 100)}...`);
      console.log(`🔤 Contains Arabic: ${hasArabic}`);
      
    } catch (error) {
      console.log(`❌ Bible ID ${bibleId} failed:`, error);
    }
  }
  
  console.log('\n🏁 Bible API testing complete!');
}