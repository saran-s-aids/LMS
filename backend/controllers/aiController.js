const Book = require('../models/Book');
const Category = require('../models/Category');

// @desc    Handle AI Chat queries
// @route   POST /api/ai/chat
// @access  Private (Student)
const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const lowerMessage = message.toLowerCase();

        // 1. Detect Intent: Summarization
        if (lowerMessage.includes('summarize')) {
            // Extract book title: "Summarize book: Introduction to AI" or "summarize AI books"
            const bookTitle = message.replace(/summarize/i, '').replace(/book:/i, '').trim();

            if (!bookTitle) {
                return res.json({ 
                    type: 'error', 
                    text: 'Please provide a book title to summarize. (e.g., "Summarize book: AI Fundamentals")' 
                });
            }

            const book = await Book.findOne({ 
                title: { $regex: bookTitle, $options: 'i' } 
            });

            if (book) {
                return res.json({
                    type: 'summary',
                    text: book.description || `The book "${book.title}" by ${book.author} is a great resource in the ${book.category} category. (No detailed summary available in database yet).`
                });
            } else {
                return res.json({
                    type: 'error',
                    text: "Sorry, this book is not available in the library."
                });
            }
        }

        // 2. Detect Intent: Recommendation
        if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('books')) {
            // Extract keywords: "Suggest machine learning books" -> "machine learning"
            const keywords = message
                .replace(/recommend/i, '')
                .replace(/suggest/i, '')
                .replace(/books/i, '')
                .replace(/for/i, '')
                .replace(/about/i, '')
                .trim();

            // Find categories matching keywords
            const matchedCategories = await Category.find({
                name: { $regex: keywords, $options: 'i' }
            });
            const categoryIds = matchedCategories.map(c => c._id);

            // Search books by title, author, category, or description
            const books = await Book.find({
                $and: [
                    { availability: 'Available' },
                    {
                        $or: [
                            { title: { $regex: keywords, $options: 'i' } },
                            { author: { $regex: keywords, $options: 'i' } },
                            { description: { $regex: keywords, $options: 'i' } },
                            { category: { $in: categoryIds } }
                        ]
                    }
                ]
            }).populate('category', 'name').limit(5);

            if (books.length > 0) {
                return res.json({
                    type: 'recommendation',
                    books: books.map(b => ({
                        title: b.title,
                        author: b.author,
                        category: b.category ? b.category.name : 'Uncategorized',
                        description: b.description
                    }))
                });
            } else {
                return res.json({
                    type: 'error',
                    text: `I couldn't find any available books matching "${keywords}". Try another category or keyword.`
                });
            }
        }

        // Default response
        return res.json({
            type: 'default',
            text: "I can help you find books or summarize them. Try asking 'Suggest AI books' or 'Summarize book: <title>'."
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'Server error in AI Chatbot' });
    }
};

module.exports = { chatWithAI };
