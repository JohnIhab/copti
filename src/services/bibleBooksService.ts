import { getSpecificVerse, BibleVerse } from "./bibleService";
// Fetch all verses in a chapter, with Arabic text
export async function getChapterVersesWithText(
  bookId: string,
  chapterNumber: number
): Promise<BibleVerse[]> {
  // Get all verse IDs in the chapter
  const verseIds = await getChapterVerses(bookId, chapterNumber);
  // Fetch each verse's Arabic text using getSpecificVerse
  const verses: BibleVerse[] = [];
  for (const verseId of verseIds) {
    const verse = await getSpecificVerse(verseId);
    if (verse) verses.push(verse);
  }
  return verses;
}
// bibleBooksService.ts
// Service to fetch all Bible books and chapters from the API
import axios from "axios";

const API_KEY = "8fb1094aa86c7d1a931deaabfa34809e";
// Use the primary Arabic Bible ID for book/chapter listing
const ARABIC_BIBLE_ID = "b17e246951402e50-01";

export interface BibleBook {
  id: string;
  name: string;
  nameLong: string;
  chapters: number[];
}

export async function getAllBibleBooks(): Promise<BibleBook[]> {
  const response = await axios.get(
    `https://api.scripture.api.bible/v1/bibles/${ARABIC_BIBLE_ID}/books`,
    {
      headers: { "api-key": API_KEY },
    }
  );
  // The API returns an array of books with id, name, etc.
  return response.data.data.map((book: any) => ({
    id: book.id,
    name: book.name,
    nameLong: book.nameLong,
    chapters: book.chapters || [],
  }));
}

export async function getBookChapters(bookId: string): Promise<number[]> {
  const response = await axios.get(
    `https://api.scripture.api.bible/v1/bibles/${ARABIC_BIBLE_ID}/books/${bookId}/chapters`,
    {
      headers: { "api-key": API_KEY },
    }
  );
  // The API returns an array of chapters with id (e.g., JHN.1, JHN.2, ...)
  return response.data.data.map((chapter: any) =>
    chapter.number ? Number(chapter.number) : chapter.id
  );
}

export async function getChapterVerses(
  bookId: string,
  chapterNumber: number
): Promise<string[]> {
  const chapterId = `${bookId}.${chapterNumber}`;
  const response = await axios.get(
    `https://api.scripture.api.bible/v1/bibles/${ARABIC_BIBLE_ID}/chapters/${chapterId}/verses`,
    {
      headers: { "api-key": API_KEY },
    }
  );
  // The API returns an array of verses with id (e.g., JHN.1.1, JHN.1.2, ...)
  return response.data.data.map((verse: any) => verse.id);
}
