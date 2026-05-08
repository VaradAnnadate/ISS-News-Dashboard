import { useState, useEffect } from 'react';

const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function useNewsData() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setNews(data);
            setLoading(false);
            return;
          }
        }
      }

      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) {
        throw new Error("Missing News API Key in .env");
      }

      const res = await fetch(`https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en`);
      const data = await res.json();

      if (data.status === 'success') {
        const articles = data.results.map((article, index) => ({
          id: article.article_id || index.toString(),
          title: article.title,
          description: article.description || article.content,
          source: article.source_id || 'Unknown',
          category: (article.category && article.category.length > 0) ? article.category[0] : 'general',
          author: article.creator ? article.creator.join(', ') : 'Unknown',
          date: new Date(article.pubDate),
          url: article.link,
          image: article.image_url
        })).slice(0, 15); // Show max 15

        setNews(articles);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: articles, timestamp: Date.now() }));
      } else {
         if (data.results && data.results.message) {
             throw new Error(data.results.message);
         }
         throw new Error("Failed to fetch news");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, loading, error, fetchNews };
}
