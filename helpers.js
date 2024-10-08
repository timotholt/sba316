// Helper functions
const isSymbol = (o) => typeof o === 'symbol'       // Is object a symbol
function isSymbolInList(symbol, symbolList) {
    return symbolList.includes(symbol);
}
