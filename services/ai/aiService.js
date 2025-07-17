// Hàm phân loại prompt
function classifyPrompt(prompt) {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('ngạn ngữ') || promptLower.includes('ca dao')) {
        return 'Ngạn ngữ';
    } else if (promptLower.includes('thơ') || promptLower.includes('bài thơ')) {
        return 'Bài thơ hay về hôn nhân';
    } else if (promptLower.includes('hôn nhân') || promptLower.includes('vợ chồng')) {
        return 'Câu nói hay về hôn nhân';
    }
    
    return 'all';
}

// Function to get AI generated recommendation
async function getAIGeneratedRecommendation(prompt, googleSheetData) {
    try {
        // Phân loại prompt
        const promptType = classifyPrompt(prompt);
        
        // Lọc dữ liệu dựa trên loại prompt
        let filteredData = googleSheetData.filter(item => {
            if (promptType === 'all') return true;
            return item.category.toLowerCase().includes(promptType.toLowerCase());
        });

        // Nếu không tìm thấy kết quả, thử tìm kiếm theo từ khóa
        if (filteredData.length === 0) {
            filteredData = googleSheetData.filter(item => 
                item.content.toLowerCase().includes(prompt.toLowerCase())
            );
        }

        if (filteredData.length === 0) {
            return {
                message: "Không tìm thấy nội dung phù hợp với yêu cầu của bạn.",
                suggestions: [
                    "Bạn có thể thử tìm kiếm với các từ khóa như: 'Ngạn ngữ', 'Hôn nhân', 'Thơ'",
                    "Hoặc bạn có thể cho biết thêm về ngữ cảnh cụ thể bạn muốn sử dụng"
                ],
                categories: [...new Set(googleSheetData.map(item => item.category))]
            };
        }

        // Chọn ngẫu nhiên một câu từ dữ liệu đã lọc
        const randomIndex = Math.floor(Math.random() * filteredData.length);
        const selectedQuote = filteredData[randomIndex];

        // Tạo các biến thể của câu trả lời dựa trên loại nội dung
        const variations = {
            'Ngạn ngữ': [
                `Đây là một câu ngạn ngữ dân gian: "${selectedQuote.content}"`,
                `Tôi tìm thấy câu ngạn ngữ này: "${selectedQuote.content}"`,
                `Có thể bạn sẽ thích câu ngạn ngữ này: "${selectedQuote.content}"`
            ],
            'Câu nói hay về hôn nhân': [
                `Đây là một câu nói hay về hôn nhân: "${selectedQuote.content}"`,
                `Tôi tìm thấy câu nói này về hôn nhân: "${selectedQuote.content}"`,
                `Có thể bạn sẽ thích câu nói này về hôn nhân: "${selectedQuote.content}"`
            ],
            'Bài thơ hay về hôn nhân': [
                `Đây là một bài thơ hay về hôn nhân:\n${selectedQuote.content}`,
                `Tôi tìm thấy bài thơ này về hôn nhân:\n${selectedQuote.content}`,
                `Có thể bạn sẽ thích bài thơ này về hôn nhân:\n${selectedQuote.content}`
            ]
        };

        // Chọn biến thể phù hợp với loại nội dung
        const categoryVariations = variations[selectedQuote.category] || variations['Câu nói hay về hôn nhân'];
        const randomVariation = categoryVariations[Math.floor(Math.random() * categoryVariations.length)];

        // Thêm thông tin bổ sung dựa trên loại nội dung
        let additionalInfo = "";
        switch(selectedQuote.category) {
            case "Ngạn ngữ":
                additionalInfo = "\n\nĐây là một câu ngạn ngữ dân gian, thường được sử dụng trong các dịp lễ cưới hoặc để bày tỏ tình cảm.";
                break;
            case "Câu nói hay về hôn nhân":
                additionalInfo = "\n\nĐây là một câu nói ý nghĩa về hôn nhân, có thể dùng làm lời chúc mừng hoặc chia sẻ kinh nghiệm.";
                break;
            case "Bài thơ hay về hôn nhân":
                additionalInfo = "\n\nĐây là một bài thơ về tình yêu và hôn nhân, có thể dùng làm lời chúc mừng đám cưới hoặc bày tỏ tình cảm.";
                break;
        }

        // Tạo response với các lựa chọn thay thế được phân loại
        const alternatives = filteredData
            .filter((_, index) => index !== randomIndex)
            .slice(0, 3)
            .reduce((acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push(item.content);
                return acc;
            }, {});

        return {
            message: randomVariation + additionalInfo,
            quote: selectedQuote.content,
            category: selectedQuote.category,
            alternatives: alternatives,
            context: {
                promptType: promptType,
                totalMatches: filteredData.length,
                categories: [...new Set(filteredData.map(item => item.category))]
            }
        };
    } catch (error) {
        console.error('Error generating AI recommendation:', error);
        throw new Error('Failed to generate recommendation');
    }
}

module.exports = {
    getAIGeneratedRecommendation,
    classifyPrompt
}; 