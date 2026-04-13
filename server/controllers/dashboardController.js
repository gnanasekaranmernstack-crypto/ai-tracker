const Tool = require('../models/Tool');

const getDashboardStats = async (req, res) => {
  try {
    const tools = await Tool.find({ user: req.user._id });
    
    const now = new Date();
    
    let activeToolsCount = 0;
    let expiredToolsCount = 0;
    let upcomingRenewalsCount = 0; // renewals in next 7 days

    tools.forEach(tool => {
      const isExpired = new Date(tool.endDate) < now;
      if (isExpired) {
        expiredToolsCount++;
      } else {
        activeToolsCount++;
      }
      
      const timeToRenewal = new Date(tool.renewalDate).getTime() - now.getTime();
      const daysToRenewal = timeToRenewal / (1000 * 3600 * 24);
      if (daysToRenewal >= 0 && daysToRenewal <= 7) {
        upcomingRenewalsCount++;
      }
    });

    // Generate monthly usage data for charts based on tools added per month or ending per month.
    // For simplicity, we'll count how many tools expire in each month of the current year.
    const currentYear = now.getFullYear();
    const monthlyDataMap = Array.from({length: 12}, (_, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      active: 0,
      expired: 0
    }));

    tools.forEach(tool => {
        const endDate = new Date(tool.endDate);
        if (endDate.getFullYear() === currentYear) {
            const mIndex = endDate.getMonth();
            if (endDate < now) {
                monthlyDataMap[mIndex].expired++;
            } else {
                monthlyDataMap[mIndex].active++;
            }
        }
    });

    res.json({
      totalTools: tools.length,
      activeTools: activeToolsCount,
      expiredTools: expiredToolsCount,
      upcomingRenewals: upcomingRenewalsCount,
      chartData: monthlyDataMap
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
