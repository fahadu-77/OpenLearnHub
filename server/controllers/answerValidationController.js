exports.validateDescriptiveAnswer = async (req, res) => {
  try {
    const { answer, expectedKeywords } = req.body;

    if (!answer || !Array.isArray(expectedKeywords)) {
      return res.status(400).json({ msg: 'Invalid payload' });
    }

    const normalizedAnswer = answer.toLowerCase();

    const matched = [];
    const missing = [];

    expectedKeywords.forEach((keyword) => {
      if (normalizedAnswer.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    });

    const score =
      expectedKeywords.length === 0
        ? 0
        : Math.round((matched.length / expectedKeywords.length) * 100);

    let result = 'fail';
    if (score >= 70) result = 'pass';
    else if (score >= 40) result = 'partial';

    res.json({
      result,
      score,
      matchedKeywords: matched,
      missingKeywords: missing,
    });

  } catch (err) {
    console.error('Answer validation error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
