exports.asyncWrapper = function(fn) {
	return function (req, res) {
        try {
            fn(req, res)
        } catch(err) {
            return res.status(400).json({ 
                status: 'fail', 
                message: err.message, 
            });
        }
	};
};