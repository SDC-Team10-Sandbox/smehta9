async function handler(_event: any) {
    try {
        // Your logic here
        console.log("Handler function executed successfully");
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Handler function executed successfully" })
        };
    } catch (error) {
        console.error("Error occurred in handler function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" })
        };
    }
}

// Export the handler function
module.exports.handler = handler;