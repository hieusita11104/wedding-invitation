const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy API Key từ biến môi trường (KHÔNG ĐẶT TRỰC TIẾP VÀO CODE)
const API_KEY = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function getAIGeneratedRecommendation(prompt, googleSheetData) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Hoặc "gemini-1.5-pro-latest"

        // Xây dựng prompt để AI có thể hiểu và sử dụng dữ liệu từ Google Sheet
        let context = "Bạn là một AI chuyên về hôn nhân và tình yêu, giúp tạo ra những câu nói, ngạn ngữ, ca dao, tục ngữ, bài thơ hay cho thiệp cưới.\n\n";
        context += "Dưới đây là một số ví dụ về các câu nói hay về hôn nhân, được phân loại theo danh mục:\n\n";

        // Thêm dữ liệu từ Google Sheet vào ngữ cảnh của AI
        googleSheetData.forEach(item => {
            context += `- Danh mục: ${item.category}\n  Nội dung: "${item.content}"\n\n`;
        });

        context += `Người dùng yêu cầu gợi ý cho mục: "${prompt}". Hãy đưa ra một số gợi ý phù hợp, có thể lấy từ dữ liệu đã cung cấp hoặc tạo ra những câu mới tương tự, nhấn mạnh sự lãng mạn và ý nghĩa của hôn nhân.`;

        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Xin lỗi, tôi không thể tạo ra gợi ý lúc này.";
    }
}

// Ví dụ sử dụng:
// async function testRecommendation() {
//     const sayings = await getWeddingSayings(); // Lấy dữ liệu từ Google Sheet
//     if (sayings.length > 0) {
//         const prompt = "lời chúc từ cha mẹ";
//         const recommendation = await getAIGeneratedRecommendation(prompt, sayings);
//         console.log(recommendation);
//     }
// }
// testRecommendation();
