const createTypeDefine = (jsonData, showAnnotation = true) => {
  const transTypeMap = {
    string: "string",
    integer: "number",
    array: "[]",
  };

  const prefixIndent = (str, indent = 0, step = "  ") => {
    return `${step.repeat(indent)}${str}`;
  };
  const addRow = (str, indent, step) => {
    return `${prefixIndent(str, indent, step)}\n`;
  };

  const getDescription = (value) => {
    return value.description ? `// ${value.description}` : "";
  };

  const transProperties = (value, options) => {
    const { indent, prefix = "", suffix = "", append = addRow } = options;
    const nextIndent = indent + 2;
    let str = prefix;
    let flag = false;
    if (value.originalRef) {
      str += `${value.originalRef}`;
    } else {
      switch (value.type) {
        case "object":
          str += `{`;
          for (const key in value.properties) {
            if (!flag) {
              str += addRow("");
            }
            flag = true;
            const desc = getDescription(value.properties[key]);
            if (desc && showAnnotation) {
              str += addRow(desc, nextIndent);
            }
            str += addRow(
              transProperties(value.properties[key], {
                prefix: `${key}: `,
                indent: nextIndent,
                append: prefixIndent,
                suffix: ";",
              }),
              nextIndent
            );
          }
          str += prefixIndent("}", flag ? indent : 0);
          break;
        case "array":
          str += `${transProperties(value.items, {
            indent,
            append: prefixIndent,
          })}${transTypeMap[value.type]}`;
          break;
        default:
          str += `${transTypeMap[value.type]}`;
      }
    }
    str += suffix;
    return str;
  };
  const transDefineToType = (jsonSchema, indent = 0) => {
    let str = "";
    str += addRow(`// ${jsonSchema.title}`, indent);
    str += transProperties(jsonSchema, {
      indent,
      prefix: `export type ${jsonSchema.title} = `,
      suffix: ";",
    });
    str += addRow("", indent);
    return str;
  };
  const { definitions } = jsonData;
  let result = "";
  for (const key in definitions) {
    const value = definitions[key];
    result += addRow(`${transDefineToType(value)}`);
  }
  return result;
};

export { createTypeDefine };
