"use strict";

module.exports = function({ types: t }) {
    return {
        name: "console-identifier",
        visitor: {
        CallExpression(path, state) {
            const { node } = path
            const callee = path.get("callee");

            if (!callee.isMemberExpression()) return;

            if (isIncludedConsole(callee, state.opts.exclude)) {
                // console.log()
                if (path.parentPath.isExpressionStatement()) {
                    for (let index = 0; index < node.arguments.length; index++) {
                        const arg = node.arguments[index];
                        if (t.isIdentifier(arg)) {
                            node.arguments.splice(index, 0, t.StringLiteral(arg.name))
                            index++
                        }
                    }
                    
                }
            }
        }
    }
};

function isGlobalConsoleId(id) {
    const name = "console";
    return (
        id.isIdentifier({ name }) &&
        !id.scope.getBinding(name) &&
        id.scope.hasGlobal(name)
    );
}

function isIncludedConsole(memberExpr, excludeArray) {
    const object = memberExpr.get("object");
    const property = memberExpr.get("property");

    if (isGlobalConsoleId(object)) return true;

    return (
        isGlobalConsoleId(object.get("object")) &&
        (property.isIdentifier({ name: "call" }) ||
        property.isIdentifier({ name: "apply" }))
    );
    }
};