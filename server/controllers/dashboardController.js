const Tool = require('../models/Tool');

const getEndOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const getDashboardStats = async (req, res) => {
  try {
    const tools = await Tool.find({ user: req.user._id })
      .populate('emails', 'emailAddress')
      .sort({ renewalDate: 1 })
      .lean();
    
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    let activeToolsCount = 0;
    let expiredToolsCount = 0;
    let upcomingRenewalsCount = 0; // renewals in next 7 days

    tools.forEach(tool => {
      const endDate = getEndOfDay(tool.endDate);
      const renewalDate = new Date(tool.renewalDate);
      const isExpired = endDate < now && renewalDate > now;
      if (isExpired) {
        expiredToolsCount++;
      } else {
        activeToolsCount++;
      }
      
      const timeToRenewal = renewalDate.getTime() - now.getTime();
      const daysToRenewal = timeToRenewal / (1000 * 3600 * 24);
      if (daysToRenewal >= 0 && daysToRenewal <= 7) {
        upcomingRenewalsCount++;
      }
    });

    const notifications = tools
      .filter((tool) => {
        const endDate = getEndOfDay(tool.endDate);
        const renewalDate = new Date(tool.renewalDate);
        const hoursUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const hoursFromRenewal = (now.getTime() - renewalDate.getTime()) / (1000 * 60 * 60);
        const hoursUntilRenewal = (renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        return (
          (hoursUntilEnd >= -24 && hoursUntilEnd <= 24) ||
          (hoursFromRenewal >= 0 && hoursFromRenewal <= 24) ||
          (hoursUntilRenewal >= 0 && hoursUntilRenewal <= 24)
        );
      })
      .slice(0, 6)
      .map((tool) => {
        const endDate = getEndOfDay(tool.endDate);
        const renewalDate = new Date(tool.renewalDate);

        if (renewalDate <= now && (now.getTime() - renewalDate.getTime()) / (1000 * 60 * 60) <= 24) {
          return {
            id: `${tool._id}-renewal`,
            type: 'renewal',
            text: `${tool.toolName} renewal is active now.`,
            date: renewalDate.toISOString()
          };
        }

        if (endDate < now && (now.getTime() - endDate.getTime()) / (1000 * 60 * 60) <= 24) {
          return {
            id: `${tool._id}-expired`,
            type: 'expired',
            text: `${tool.toolName} expired on ${endDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}.`,
            date: endDate.toISOString()
          };
        }

        if (renewalDate >= now && renewalDate <= oneWeekFromNow) {
          return {
            id: `${tool._id}-renewal-upcoming`,
            type: 'renewal',
            text: `${tool.toolName} renews on ${renewalDate.toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}.`,
            date: renewalDate.toISOString()
          };
        }

        return {
          id: `${tool._id}-ending`,
          type: 'ending',
          text: `${tool.toolName} access ends on ${endDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}.`,
          date: endDate.toISOString()
        };
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
        const endDate = getEndOfDay(tool.endDate);
        const renewalDate = new Date(tool.renewalDate);
        if (endDate.getFullYear() === currentYear) {
            const mIndex = endDate.getMonth();
            if (endDate < now && renewalDate > now) {
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
      chartData: monthlyDataMap,
      notifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
