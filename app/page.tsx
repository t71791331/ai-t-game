"use client";
// 1. Добавляем тип для истории, чтобы AI понимал контекст
type HistoryItem = { step: string; question: string; answer: string };

// 2. Основная функция запроса к API
async function getAIResponse(
  userAnswer: string,
  step: string,
  history: HistoryItem[]
) {
  const API_KEY = "YOUR_OPENAI_API_KEY"; // В продакшене используйте прокси-сервер!

  const prompt = `
    Ты — эмпатичный психолог и ведущий трансформационной игры. 
    Текущий этап игры: "${step}".
    История игрока: ${JSON.stringify(history)}.
    Последний ответ пользователя: "${userAnswer}".
    
    Твоя задача:
    1. Дать короткий (2-3 предложения) глубокий инсайт или поддержку как психолог.
    2. Из списка доступных карт для следующего этапа "${step}" выбери ОДНУ самую подходящую.
    
    Список доступных карт: ${JSON.stringify(CARDS[step])}
    
    Верни ответ строго в формате JSON:
    { "comment": "твой комментарий", "chosenCard": "текст выбранной карты" }
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o", // или gpt-3.5-turbo
      messages: [{ role: "system", content: prompt }],
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// 3. Обновленный компонент
export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [card, setCard] = useState("");
  const [answer, setAnswer] = useState("");
  const [ai, setAi] = useState({ comment: "", loading: false });

  const submit = async () => {
    setAi((prev) => ({ ...prev, loading: true }));

    try {
      // Получаем умный ответ и следующую карту
      const result = await getAIResponse(answer, STEPS[stepIndex], history);

      setAi({ comment: result.comment, loading: false });

      // Сохраняем шаг в историю
      setHistory([
        ...history,
        { step: STEPS[stepIndex], question: card, answer },
      ]);

      // Автоматически подготавливаем карту для следующего шага, если он есть
      // (или оставляем ту, что выбрал AI для текущего, если вы еще не нажали "Next")
      if (result.chosenCard) {
        setCard(result.chosenCard);
      }
    } catch (error) {
      console.error("Ошибка AI:", error);
      setAi({
        comment: "Связь с космосом прервалась. Попробуй еще раз.",
        loading: false,
      });
    }
  };

  // ... остальной UI (добавьте индикатор загрузки ai.loading)
}
