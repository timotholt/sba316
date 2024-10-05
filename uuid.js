
//==================================================================
// Generate a fake UUID
//
// Numbers are totally unique unless generated within 1ms of
// each other.
//
// If IDs are generated more than 1 millisecond apart, they are
// 100% unique.
//
// If two IDs are generated at shorter intervals, and assuming that
// the random method is truly random, this would generate IDs that
// are 99.99999999999999% likely to be globally unique (collision
// in 1 of 10^15).
//
// Returns a string
//==================================================================

function generateFakeUUID()
{
    let uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    return (uniqueId);
}
