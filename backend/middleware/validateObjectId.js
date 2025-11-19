import { ObjectId } from "mongodb";

/**
 * REFACTOR: Extracted duplicate ObjectId validation logic into reusable middleware
 * BEFORE: ObjectId validation was repeated in every route handler
 * AFTER: Single source of truth for validation, reducing code duplication
 * 
 * This middleware validates ObjectId parameters from req.params or req.query
 * Usage: router.get('/:id', validateObjectId('id'), handler)
 */
export const validateObjectId = (paramName, source = 'params') => {
  return (req, res, next) => {
    const id = source === 'params' ? req.params[paramName] : req.query[paramName];
    
    // Check if the ID exists
    if (!id) {
      return res.status(400).json({ 
        message: `${paramName} is required.` 
      });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: `Invalid ${paramName} format.` 
      });
    }

    // Attach validated ObjectId to request for downstream use
    req.validatedIds = req.validatedIds || {};
    req.validatedIds[paramName] = new ObjectId(id);
    
    next();
  };
};
