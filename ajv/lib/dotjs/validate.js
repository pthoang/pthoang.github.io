'use strict';
module.exports = function generate_validate(it, $keyword) {
  var out = '';
  var $async = it.schema.$async === true;
  if (it.isTop) {
    var $top = it.isTop,
      $lvl = it.level = 0,
      $dataLvl = it.dataLevel = 0,
      $data = 'data';
    it.rootId = it.resolve.fullPath(it.root.schema.id);
    it.baseId = it.baseId || it.rootId;
    if ($async) {
      it.async = true;
      var $es7 = it.opts.async == 'es7';
      it.yieldAwait = $es7 ? 'await' : 'yield';
    }
    delete it.isTop;
    it.dataPathArr = [undefined];
    out += ' validate = ';
    if ($async) {
      if ($es7) {
        out += ' (async function ';
      } else {
        if (it.opts.async == 'co*') {
          out += 'co.wrap';
        }
        out += '(function* ';
      }
    } else {
      out += ' (function ';
    }
    out += ' (data, dataPath, parentData, parentDataProperty) { \'use strict\'; var vErrors = null; ';
    out += ' var errors = 0;     ';
  } else {
    var $lvl = it.level,
      $dataLvl = it.dataLevel,
      $data = 'data' + ($dataLvl || '');
    if (it.schema.id) it.baseId = it.resolve.url(it.baseId, it.schema.id);
    if ($async && !it.async) throw new Error('async schema in sync schema');
    out += ' var errs_' + ($lvl) + ' = errors;';
  }
  var $valid = 'valid' + $lvl,
    $breakOnError = !it.opts.allErrors,
    $closingBraces1 = '',
    $closingBraces2 = '',
    $errorKeyword;
  var $typeSchema = it.schema.type,
    $typeIsArray = Array.isArray($typeSchema);
  if ($typeSchema && it.opts.coerceTypes) {
    var $coerceToTypes = it.util.coerceToTypes($typeSchema);
    if ($coerceToTypes) {
      var $schemaPath = it.schemaPath + '.type',
        $errSchemaPath = it.errSchemaPath + '/type',
        $method = $typeIsArray ? 'checkDataTypes' : 'checkDataType';
      out += ' if (' + (it.util[$method]($typeSchema, $data, true)) + ') {  ';
      var $dataType = 'dataType' + $lvl,
        $coerced = 'coerced' + $lvl;
      out += ' var ' + ($dataType) + ' = typeof ' + ($data) + '; var ' + ($coerced) + ' = undefined; ';
      var $bracesCoercion = '';
      var arr1 = $coerceToTypes;
      if (arr1) {
        var $type, $i = -1,
          l1 = arr1.length - 1;
        while ($i < l1) {
          $type = arr1[$i += 1];
          if ($i) {
            out += ' if (' + ($coerced) + ' === undefined) { ';
            $bracesCoercion += '}';
          }
          if ($type == 'string') {
            out += ' if (' + ($dataType) + ' == \'number\' || ' + ($dataType) + ' == \'boolean\') ' + ($coerced) + ' = \'\' + ' + ($data) + '; else if (' + ($data) + ' === null) ' + ($coerced) + ' = \'\'; ';
          } else if ($type == 'number' || $type == 'integer') {
            out += ' if (' + ($dataType) + ' == \'boolean\' || ' + ($data) + ' === null || (' + ($dataType) + ' == \'string\' && ' + ($data) + ' && ' + ($data) + ' == +' + ($data) + ' ';
            if ($type == 'integer') {
              out += ' && !(' + ($data) + ' % 1)';
            }
            out += ')) ' + ($coerced) + ' = +' + ($data) + '; ';
          } else if ($type == 'boolean') {
            out += ' if (' + ($data) + ' === \'false\' || ' + ($data) + ' === 0 || ' + ($data) + ' === null) ' + ($coerced) + ' = false; else if (' + ($data) + ' === \'true\' || ' + ($data) + ' === 1) ' + ($coerced) + ' = true; ';
          } else if ($type == 'null') {
            out += ' if (' + ($data) + ' === \'\' || ' + ($data) + ' === 0 || ' + ($data) + ' === false) ' + ($coerced) + ' = null; ';
          }
        }
      }
      out += ' ' + ($bracesCoercion) + ' if (' + ($coerced) + ' === undefined) {   ';
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = ''; /* istanbul ignore else */
      if (it.createErrors !== false) {
        out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: "' + ($errSchemaPath) + '" , params: { type: \'';
        if ($typeIsArray) {
          out += '' + ($typeSchema.join(","));
        } else {
          out += '' + ($typeSchema);
        }
        out += '\' } ';
        if (it.opts.messages !== false) {
          out += ' , message: \'should be ';
          if ($typeIsArray) {
            out += '' + ($typeSchema.join(","));
          } else {
            out += '' + ($typeSchema);
          }
          out += '\' ';
        }
        if (it.opts.verbose) {
          out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
        }
        out += ' } ';
      } else {
        out += ' {} ';
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
        if (it.async) {
          out += ' throw new ValidationError([' + (__err) + ']); ';
        } else {
          out += ' validate.errors = [' + (__err) + ']; return false; ';
        }
      } else {
        out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
      }
      out += ' } else { ';
      if ($dataLvl) {
        var $parentData = 'data' + (($dataLvl - 1) || ''),
          $dataProperty = it.dataPathArr[$dataLvl];
        out += ' ' + ($data) + ' = ' + ($parentData) + '[' + ($dataProperty) + '] = ' + ($coerced) + '; ';
      } else {
        out += ' data = ' + ($coerced) + '; if (parentData !== undefined) parentData[parentDataProperty] = ' + ($coerced) + '; ';
      }
      out += ' } } ';
    }
  }
  var arr2 = it.RULES;
  if (arr2) {
    var $rulesGroup, i2 = -1,
      l2 = arr2.length - 1;
    while (i2 < l2) {
      $rulesGroup = arr2[i2 += 1];
      if ($shouldUseGroup($rulesGroup)) {
        if ($rulesGroup.type) {
          out += ' if (' + (it.util.checkDataType($rulesGroup.type, $data)) + ') { ';
        }
        if (it.opts.useDefaults && !it.compositeRule) {
          if ($rulesGroup.type == 'object' && it.schema.properties) {
            var $schema = it.schema.properties,
              $schemaKeys = Object.keys($schema);
            var arr3 = $schemaKeys;
            if (arr3) {
              var $propertyKey, i3 = -1,
                l3 = arr3.length - 1;
              while (i3 < l3) {
                $propertyKey = arr3[i3 += 1];
                var $sch = $schema[$propertyKey];
                if ($sch.default !== undefined) {
                  var $passData = $data + it.util.getProperty($propertyKey);
                  out += '  if (' + ($passData) + ' === undefined) ' + ($passData) + ' = ';
                  if (it.opts.useDefaults == 'shared') {
                    out += ' ' + (it.useDefault($sch.default)) + ' ';
                  } else {
                    out += ' ' + (JSON.stringify($sch.default)) + ' ';
                  }
                  out += '; ';
                }
              }
            }
          } else if ($rulesGroup.type == 'array' && Array.isArray(it.schema.items)) {
            var arr4 = it.schema.items;
            if (arr4) {
              var $sch, $i = -1,
                l4 = arr4.length - 1;
              while ($i < l4) {
                $sch = arr4[$i += 1];
                if ($sch.default !== undefined) {
                  var $passData = $data + '[' + $i + ']';
                  out += '  if (' + ($passData) + ' === undefined) ' + ($passData) + ' = ';
                  if (it.opts.useDefaults == 'shared') {
                    out += ' ' + (it.useDefault($sch.default)) + ' ';
                  } else {
                    out += ' ' + (JSON.stringify($sch.default)) + ' ';
                  }
                  out += '; ';
                }
              }
            }
          }
        }
        var arr5 = $rulesGroup.rules;
        if (arr5) {
          var $rule, i5 = -1,
            l5 = arr5.length - 1;
          while (i5 < l5) {
            $rule = arr5[i5 += 1];
            if ($shouldUseRule($rule)) {
              if ($rule.custom) {
                var $schema = it.schema[$rule.keyword],
                  $ruleValidate = it.useCustomRule($rule, $schema, it.schema, it),
                  $ruleErrs = $ruleValidate.code + '.errors',
                  $schemaPath = it.schemaPath + '.' + $rule.keyword,
                  $errSchemaPath = it.errSchemaPath + '/' + $rule.keyword,
                  $errs = 'errs' + $lvl,
                  $i = 'i' + $lvl,
                  $ruleErr = 'ruleErr' + $lvl,
                  $rDef = $rule.definition,
                  $asyncKeyword = $rDef.async,
                  $inline = $rDef.inline,
                  $macro = $rDef.macro;
                if ($asyncKeyword && !it.async) throw new Error('async keyword in sync schema');
                if (!($inline || $macro)) {
                  out += '' + ($ruleErrs) + ' = null;';
                }
                out += 'var ' + ($errs) + ' = errors;var valid' + ($lvl) + ';';
                if ($inline && $rDef.statements) {
                  out += ' ' + ($ruleValidate.validate);
                } else if ($macro) {
                  var $it = it.util.copy(it);
                  $it.level++;
                  $it.schema = $ruleValidate.validate;
                  $it.schemaPath = '';
                  var $wasComposite = it.compositeRule;
                  it.compositeRule = $it.compositeRule = true;
                  var $code = it.validate($it).replace(/validate\.schema/g, $ruleValidate.code);
                  it.compositeRule = $it.compositeRule = $wasComposite;
                  out += ' ' + ($code);
                } else if ($rDef.compile || $rDef.validate) {
                  var $$outStack = $$outStack || [];
                  $$outStack.push(out);
                  out = '';
                  out += '  ' + ($ruleValidate.code) + '.call( ';
                  if (it.opts.passContext) {
                    out += 'this';
                  } else {
                    out += 'self';
                  }
                  if ($rDef.compile || $rDef.schema === false) {
                    out += ' , ' + ($data) + ' ';
                  } else {
                    out += ' , validate.schema' + ($schemaPath) + ' , ' + ($data) + ' , validate.schema' + (it.schemaPath) + ' ';
                  }
                  out += ' , (dataPath || \'\')';
                  if (it.errorPath != '""') {
                    out += ' + ' + (it.errorPath);
                  }
                  if ($dataLvl) {
                    out += ' , data' + (($dataLvl - 1) || '') + ' , ' + (it.dataPathArr[$dataLvl]) + ' ';
                  } else {
                    out += ' , parentData , parentDataProperty ';
                  }
                  out += ' )  ';
                  var def_callRuleValidate = out;
                  out = $$outStack.pop();
                  if ($rDef.errors !== false) {
                    if ($asyncKeyword) {
                      $ruleErrs = 'customErrors' + $lvl;
                      out += ' var ' + ($ruleErrs) + ' = null; try { valid' + ($lvl) + ' = ' + (it.yieldAwait) + (def_callRuleValidate) + '; } catch (e) { valid' + ($lvl) + ' = false; if (e instanceof ValidationError) ' + ($ruleErrs) + ' = e.errors; else throw e; } ';
                    } else {
                      out += ' ' + ($ruleValidate.code) + '.errors = null; ';
                    }
                  }
                }
                out += 'if (! ';
                if ($inline) {
                  if ($rDef.statements) {
                    out += ' valid' + ($lvl) + ' ';
                  } else {
                    out += ' (' + ($ruleValidate.validate) + ') ';
                  }
                } else if ($macro) {
                  out += ' valid' + ($it.level) + ' ';
                } else {
                  if ($asyncKeyword) {
                    if ($rDef.errors === false) {
                      out += ' (' + (it.yieldAwait) + (def_callRuleValidate) + ') ';
                    } else {
                      out += ' valid' + ($lvl) + ' ';
                    }
                  } else {
                    out += ' ' + (def_callRuleValidate) + ' ';
                  }
                }
                out += ') { ';
                $errorKeyword = $rule.keyword;
                var $$outStack = $$outStack || [];
                $$outStack.push(out);
                out = '';
                var $$outStack = $$outStack || [];
                $$outStack.push(out);
                out = ''; /* istanbul ignore else */
                if (it.createErrors !== false) {
                  out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: "' + ($errSchemaPath) + '" , params: { keyword: \'' + ($rule.keyword) + '\' } ';
                  if (it.opts.messages !== false) {
                    out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
                  }
                  if (it.opts.verbose) {
                    out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
                  }
                  out += ' } ';
                } else {
                  out += ' {} ';
                }
                var __err = out;
                out = $$outStack.pop();
                if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
                  if (it.async) {
                    out += ' throw new ValidationError([' + (__err) + ']); ';
                  } else {
                    out += ' validate.errors = [' + (__err) + ']; return false; ';
                  }
                } else {
                  out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
                }
                var def_customError = out;
                out = $$outStack.pop();
                if ($inline) {
                  if ($rDef.errors) {
                    if ($rDef.errors != 'full') {
                      out += '  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) { ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; } if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
                      if (it.opts.verbose) {
                        out += ' ' + ($ruleErr) + '.schema = validate.schema' + ($schemaPath) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
                      }
                      out += ' } ';
                    }
                  } else {
                    if ($rDef.errors === false) {
                      out += ' ' + (def_customError) + ' ';
                    } else {
                      out += ' if (' + ($errs) + ' == errors) { ' + (def_customError) + ' } else {  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) { ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; } if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
                      if (it.opts.verbose) {
                        out += ' ' + ($ruleErr) + '.schema = validate.schema' + ($schemaPath) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
                      }
                      out += ' } } ';
                    }
                  }
                } else if ($macro) {
                  out += '   var err =   '; /* istanbul ignore else */
                  if (it.createErrors !== false) {
                    out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: "' + ($errSchemaPath) + '" , params: { keyword: \'' + ($rule.keyword) + '\' } ';
                    if (it.opts.messages !== false) {
                      out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
                    }
                    if (it.opts.verbose) {
                      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
                    }
                    out += ' } ';
                  } else {
                    out += ' {} ';
                  }
                  out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
                  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
                    if (it.async) {
                      out += ' throw new ValidationError(vErrors); ';
                    } else {
                      out += ' validate.errors = vErrors; return false ';
                    }
                  }
                } else {
                  if ($rDef.errors === false) {
                    out += ' ' + (def_customError) + ' ';
                  } else {
                    out += ' if (Array.isArray(' + ($ruleErrs) + ')) { if (vErrors === null) vErrors = ' + ($ruleErrs) + '; else vErrors = vErrors.concat(' + ($ruleErrs) + '); errors = vErrors.length;  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + '];  ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + ';   ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '";  ';
                    if (it.opts.verbose) {
                      out += ' ' + ($ruleErr) + '.schema = validate.schema' + ($schemaPath) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
                    }
                    out += ' } } else { ' + (def_customError) + ' } ';
                  }
                }
                $errorKeyword = undefined;
                out += ' } ';
                if ($breakOnError) {
                  out += ' else { ';
                }
              } else {
                out += ' ' + ($rule.code(it, $rule.keyword)) + ' ';
              }
              if ($breakOnError) {
                $closingBraces1 += '}';
              }
            }
          }
        }
        if ($breakOnError) {
          out += ' ' + ($closingBraces1) + ' ';
          $closingBraces1 = '';
        }
        if ($rulesGroup.type) {
          out += ' } ';
          if ($typeSchema && $typeSchema === $rulesGroup.type) {
            var $typeChecked = true;
            out += ' else { ';
            var $schemaPath = it.schemaPath + '.type',
              $errSchemaPath = it.errSchemaPath + '/type';
            var $$outStack = $$outStack || [];
            $$outStack.push(out);
            out = ''; /* istanbul ignore else */
            if (it.createErrors !== false) {
              out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: "' + ($errSchemaPath) + '" , params: { type: \'';
              if ($typeIsArray) {
                out += '' + ($typeSchema.join(","));
              } else {
                out += '' + ($typeSchema);
              }
              out += '\' } ';
              if (it.opts.messages !== false) {
                out += ' , message: \'should be ';
                if ($typeIsArray) {
                  out += '' + ($typeSchema.join(","));
                } else {
                  out += '' + ($typeSchema);
                }
                out += '\' ';
              }
              if (it.opts.verbose) {
                out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
              }
              out += ' } ';
            } else {
              out += ' {} ';
            }
            var __err = out;
            out = $$outStack.pop();
            if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
              if (it.async) {
                out += ' throw new ValidationError([' + (__err) + ']); ';
              } else {
                out += ' validate.errors = [' + (__err) + ']; return false; ';
              }
            } else {
              out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
            }
            out += ' } ';
          }
        }
        if ($breakOnError) {
          out += ' if (errors === ';
          if ($top) {
            out += '0';
          } else {
            out += 'errs_' + ($lvl);
          }
          out += ') { ';
          $closingBraces2 += '}';
        }
      }
    }
  }
  if ($typeSchema && !$typeChecked && !(it.opts.coerceTypes && $coerceToTypes)) {
    var $schemaPath = it.schemaPath + '.type',
      $errSchemaPath = it.errSchemaPath + '/type',
      $method = $typeIsArray ? 'checkDataTypes' : 'checkDataType';
    out += ' if (' + (it.util[$method]($typeSchema, $data, true)) + ') {   ';
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: "' + ($errSchemaPath) + '" , params: { type: \'';
      if ($typeIsArray) {
        out += '' + ($typeSchema.join(","));
      } else {
        out += '' + ($typeSchema);
      }
      out += '\' } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should be ';
        if ($typeIsArray) {
          out += '' + ($typeSchema.join(","));
        } else {
          out += '' + ($typeSchema);
        }
        out += '\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    out += ' }';
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces2) + ' ';
  }
  if ($top) {
    if ($async) {
      out += ' if (errors === 0) return true;           ';
      out += ' else throw new ValidationError(vErrors); ';
    } else {
      out += ' validate.errors = vErrors; ';
      out += ' return errors === 0;       ';
    }
    out += ' });';
  } else {
    out += ' var ' + ($valid) + ' = errors === errs_' + ($lvl) + ';';
  }
  out = it.util.cleanUpCode(out);
  if ($top && $breakOnError) {
    out = it.util.cleanUpVarErrors(out, $async);
  }

  function $shouldUseGroup($rulesGroup) {
    for (var i = 0; i < $rulesGroup.rules.length; i++)
      if ($shouldUseRule($rulesGroup.rules[i])) return true;
  }

  function $shouldUseRule($rule) {
    return it.schema[$rule.keyword] !== undefined || ($rule.keyword == 'properties' && (it.schema.additionalProperties === false || typeof it.schema.additionalProperties == 'object' || (it.schema.patternProperties && Object.keys(it.schema.patternProperties).length) || (it.opts.v5 && it.schema.patternGroups && Object.keys(it.schema.patternGroups).length)));
  }
  return out;
}
