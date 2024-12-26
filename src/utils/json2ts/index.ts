import * as _ from 'underscore';

export class Json2Ts {
  /**
   * @description convert json to ts interface 声明接口
   * @param content
   * @returns
   */
  convert(content: string, interfaceName: string = 'RootTypes'): string {
    let jsonContent = JSON.parse(content);

    let result = this.convertJsonToTsInterfaces(
      jsonContent,
      this.toUpperFirstLetter(interfaceName)
    );
    return result;
  }

  private convertJsonToTsInterfaces(jsonContent: any, interfaceName: string) {
    let interfaceKeys: string[] = [];
    let objectResult: string[] = [];

    for (const key in jsonContent) {
      let value = jsonContent[key];
      if (_.isObject(value) && !_.isArray(value)) {
        // 如果是对象 则递归
        // 1. 将对象的key转换为大写
        // 2. 将对象的value转换为接口
        // 3. 将对象的key转换为小写
        // 4. 如果 objectInterfaceName 是复数 则移除复数
        let objectInterfaceName = this.toUpperFirstLetter(key);
        let objectInterface = this.convertJsonToTsInterfaces(
          value,
          objectInterfaceName
        );
        objectResult.push(objectInterface);
        jsonContent[key] = this.removePluralChars(objectInterfaceName);
      } else if (_.isArray(value)) {
        // 如果是数组 则检测数组的类型 string[] number[] boolean[]
        const arrayTypes: any = this.detectMultiArrayTypes(value);
        console.log('arrayTypes', arrayTypes);

        // 如果是多维数组
        if (this.isMultiArray(value)) {
          let multiArrayBrackets = this.getMultiArrayBrackets(value);
          console.log('multiArrayBrackets', multiArrayBrackets);

          if (!Array.isArray(value[0][0]) && _.isObject(value[0][0])) {
            let objectInterfaceName = this.toUpperFirstLetter(key);
            let objectInterface = this.convertJsonToTsInterfaces(
              value[0][0],
              objectInterfaceName
            );
            objectResult.push(objectInterface);

            jsonContent[key] =
              this.removePluralChars(objectInterfaceName) + multiArrayBrackets;
          } else if (Array.isArray(value[0])) {
            let multiArrayTypes = this.detectMultiArrayTypes(value[0]);

            // multiArrayTypes 返回的是 number[] string[] boolean[] any[] 这种格式 需要去掉[] 否侧会多一个[]
            jsonContent[key] =
              multiArrayTypes[0].replace('[]', '') + multiArrayBrackets;
          }
        } else if (value.length > 0 && _.isObject(value[0])) {
          // 这里和上面的对象处理逻辑一样
          let objectInterfaceName = this.toUpperFirstLetter(key);
          let objectInterface = this.convertJsonToTsInterfaces(
            value[0],
            objectInterfaceName
          );
          objectResult.push(objectInterface);
          jsonContent[key] = this.removePluralChars(objectInterfaceName) + '[]';
        } else {
          jsonContent[key] = arrayTypes[0];
        }
      } else {
        jsonContent[key] = this.getType(value); // 接口的类型
        if (this.getType(value) === 'any') {
          interfaceKeys.push(key);
        }
      }
      // 接口的key
    }
    let result = this.formatCharsToTypeScript(
      jsonContent,
      interfaceName,
      interfaceKeys
    );
    objectResult.push(result);

    return objectResult.join('\t\n');
  }

  private detectMultiArrayTypes(
    value: any,
    valueType: string[] = []
  ): string[] {
    // 如果是数组 则检测数组的类型 string[] number[] boolean[]
    if (_.isArray(value)) {
      if (value.length == 0) {
        valueType.push('any[]');
      } else if (_.all(value, _.isString)) {
        valueType.push('string[]');
      } else if (_.all(value, _.isNumber)) {
        valueType.push('number[]');
      } else if (_.all(value, _.isBoolean)) {
        valueType.push('boolean[]');
      } else {
        valueType.push('any[]');
      }
    }
    return valueType;
  }

  // 判断是不是多维数组
  private isMultiArray(value: any): boolean {
    if (_.isArray(value)) {
      if (value.length > 0) {
        return _.isArray(value[0]);
      }
    }
    return false;
  }

  //
  getMultiArrayBrackets(value: any, brackets: string = ''): string {
    // 拿到value 是一个多维数组 判断是几维数组

    if (_.isArray(value)) {
      if (value.length > 0) {
        return this.getMultiArrayBrackets(value[0], brackets + '[]');
      }
    }
    console.log('brackets', brackets);

    return brackets;
  }
  // 格式化字符 { name: string, age: number } 格式
  private formatCharsToTypeScript(
    jsonContent: any,
    interfaceName: string,
    optionalKeys: string[]
  ): string {
    console.log();

    // 将对象转换为字符串 stringify 第二个参数是过滤器，第三个参数是缩进
    let result = JSON.stringify(jsonContent, null, '\t')
      .replace(new RegExp('"', 'g'), '')
      .replace(new RegExp(',', 'g'), '');

    // allKeys 检索对象自身和继承属性的所有名称
    let allKeys = _.allKeys(jsonContent);
    for (let index = 0, length = allKeys.length; index < length; index++) {
      let key = allKeys[index];

      console.log('contains', optionalKeys, key, _.contains(optionalKeys, key));

      if (_.contains(optionalKeys, key)) {
        result = result.replace(
          new RegExp(key + ':', 'g'),
          this.toLowerFirstLetter(key) + '?:'
        );
      } else {
        result = result.replace(
          new RegExp(key + ':', 'g'),
          this.toLowerFirstLetter(key) + ':'
        );
      }
    }
    interfaceName = this.removePluralChars(interfaceName);

    return 'export interface ' + interfaceName + ' ' + result;
  }

  // 移除字符中的复数 s ies S IES
  private removePluralChars(text: string): string {
    // 获取最后三个字符 转换为小写 ies -> y
    let lastThreeChars = text.slice(-3).toLowerCase();
    // 获取最后一个字符 转换为小写 s -> ''
    let lastChar = text.slice(-1).toLowerCase();
    if (lastThreeChars === 'ies') {
      text = text.slice(0, -3) + 'y';
    } else if (lastChar === 's') {
      text = text.slice(0, -1);
    }
    return text;
  }

  // 类型检验函数
  private getType(value: any): any {
    if (_.isString(value)) {
      return 'string';
    } else if (_.isNumber(value)) {
      return 'number';
    } else if (_.isBoolean(value)) {
      return 'boolean';
    } else {
      return 'any';
    }
  }

  // 首字母小写
  private toLowerFirstLetter(text: string) {
    return text.charAt(0).toLowerCase() + text.slice(1);
  }

  // 首字母大写
  private toUpperFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
