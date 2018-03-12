import fett
import re
import json
from docutils.parsers.rst import Directive, directives
from docutils import statemachine
from docutils.utils.error_reporting import ErrorString


URIMAPPER_TEMPLATE = fett.Template('''
.. raw:: html

   <input name="urimapper" value="{{urimapString}}" hidden="true">
  
''')



LEADING_WHITESPACE = re.compile(r'^\n?(\x20+)')
PAT_KEY_VALUE = re.compile(r'(.*)', re.M)




def parse_keys(lines):
    """docutils field list parsing is busted. Just do this ourselves."""
  
    result = {}
    print lines
    text = '\n'.join(lines).replace('\t', '    ')
    print "INPUT:" + text
    for match in PAT_KEY_VALUE.finditer(text):
        uriMap = {}
        if match is None:
            print "no match"
            continue
        print "**********"
        print "match" + match.group(1)
        value = match.group(1)
        print "value" + value
        if not value: 
            break
        
        valueMap = value.split(";")
        for valueItem in valueMap:
            if not valueItem:
              break
            print "valueItem" + valueItem + "endItem"
            uriMapItem = None
            uriMapItem = valueItem.split("%")
            print uriMapItem[0] + uriMapItem[1]
            localkey = uriMapItem[0]
            uriMap[localkey] = uriMapItem[1]

            result['urimapString'] = json.dumps(uriMap).replace('"', '\"');
    
    return result;
    

class UrimapperDirective(Directive):
    has_content = True
    required_arguments = 0
    optional_arguments = 0
    final_argument_whitespace = True

    def run(self):
        print self.content
        options = parse_keys(self.content)
        print options
       
      
        rendered = URIMAPPER_TEMPLATE.render(options)
       
        rendered_lines = statemachine.string2lines(
            rendered, 4, convert_whitespace=1)
        self.state_machine.insert_input(rendered_lines, '')

        return []


def setup(app):
    app.add_directive('urimapper', UrimapperDirective)

    return {
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }
