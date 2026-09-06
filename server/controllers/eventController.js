const Event = require("../models/Event.js");

exports.getAllEvents = async(req,res)=>{
    try{
        const filters = {};
        if(req.query.category){
            filters.category = req.query.category;
        }

        if(req.query.ticketPrice){
            filters.ticketPrice = req.query.ticketPrice;
        }

        const events = await Event.find();
        res.json(events);
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

// Get event by id
exports.getEventById = async (req , res)=>{
    try{
        const event = await Event.findById(req.params.id);
        if(!event){
            return res.status(404).josn({error : 'Event not found'});
        }
        res.json(event);
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
};

//Create Event 
exports.createEvent = async(req,res)=>{
    const {title, description, date, location, category, totalSeats, ticketPrice, imageUrl} = req.body;
    try{
       const event = await Event.create({

            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice,
            imageUrl,
            createdBy: req.user._id

        });

        res.status(201).json(event);
    }
    catch(error){
         console.error("CREATE EVENT ERROR:", error);
        res.status(500).json({error : error.message});
    }
};

// Update Event
exports.updateEvent = async(req,res)=>{
    const {title, description , date , lcation , category , totalSeats , ticketPrice ,imageUrl} = req.body;
    try{
        const event = await findByIdAndUpdate(req.params.id,{
            title,
            description , 
            date , 
            lcation , 
            category , 
            totalSeats , 
            ticketPrice ,
            imageUrl
        },{new:true});
        if(!event){
            return res.status(404).json({error : 'Event not found'});
        }
        res.json(event);
    }
    catch(error){
        res.status(500).josn({error:error.message});
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                error: "Event not found"
            });
        }

        res.json({
            message: "Event deleted successfully"
        });
    } catch (error) {
        console.error("DELETE EVENT ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};