import fett
import re
from docutils.parsers.rst import Directive, directives
from docutils import statemachine
from docutils.utils.error_reporting import ErrorString


URIWRITER_TEMPLATE = fett.Template('''
.. raw:: html

   <p class="uriwriter">
   <script type="text/javascript">
      
       var rollback = '{{url}}';
       var current = '&lt;URISTRING&gt;';
              
       var rollback = function () {
              
          var replacementTarget = document.getElementsByTagName("pre");
              
          for (var i = 0 ; i < replacementTarget.length ; i++) {
                  
              var item = replacementTarget.item(i);
               
              item.innerHTML = item.innerHTML.replace(current, "&lt;URISTRING&gt;");
               
              //console.log(item.innerHTML);
          }
                   
       }       
              
              
       function addRow(urlstring) {
           if (current != urlstring) {
                console.log("ROLLING BACK");
                rollback();
            }
           event.preventDefault();
           var uri = urlstring;
           var elements = document.getElementById(urlstring).elements;
           var obj ={};
           for(var i = 0 ; i < elements.length ; i++){
               var item = elements.item(i);
               obj[item.name] = item.value;
           }
           var replacementTarget = document.getElementsByTagName("pre");
           for(var i = 0 ; i < replacementTarget.length ; i++){
               var item = replacementTarget.item(i);
 
               if (item.innerHTML.indexOf(current)>-1) {
                   
                   item.innerHTML = item.innerHTML.replace("&lt;URISTRING&gt;", uri).replace("{host}", obj['hostname']).
                                    replace("{port}", obj['port']).
                                    replace("{db}", obj['db']).
                                    replace("{authdb}", obj['authdb']).
                                    replace("{username}", obj['username']);
                   current = item.innerHTML;
                   console.log(item.innerHTML);
               }
           }  
       }   
           
 
   </script>
   <form id="{{url}}" autocomplete="off">
    
    <div class="row"><fieldset>
      <input id="username" type="text" name="username" required>
      <label for="username">Username</label>
      <div class="after"></div>
    </fieldset>
    <fieldset>
      <input id="db" type="text" name="db" required>
      <label for="db">database name</label>
      <div class="db"></div>
    </fieldset>
    <fieldset>
      <input id="authdb" type="" name="authdb" required>
      <label for="authdb">Auth DB</label>
      <div class="authdb"></div>
    </fieldset>
    </div>
    <div class="hostinfo">
    <fieldset>
      <input id="hostname" type="text" name="hostname" required>
      <label for="hostname">Hostname or IP</label>
    </fieldset>
    <fieldset>
      <input id="port" type="text" name="port" required>
      <label for="port">Port</label>
        </fieldset>
    <fieldset>
      <button id="add" onclick="addRow('{{url}}')">+</button>
    </fieldset>
    </div>
  </form>
   </p>
''')

URIWRITER_TEMPLATE_TARGET = fett.Template('''
.. raw:: html
   <div class="uri">URI_STRING</div>
''')



LEADING_WHITESPACE = re.compile(r'^\n?(\x20+)')
PAT_KEY_VALUE = re.compile(r'([a-z_]+):(.*)', re.M)




def parse_keys(lines):
    """docutils field list parsing is busted. Just do this ourselves."""
    result = {}
    print lines
    text = '\n'.join(lines).replace('\t', '    ')
    print text
    for match in PAT_KEY_VALUE.finditer(text):
        if match is None:
            continue
        value = match.group(2)
        print "value" + value
        print match
        indentation_match = LEADING_WHITESPACE.match(value)
        if indentation_match is None:
            value = value.strip()
        else:
            indentation = len(indentation_match.group(1))
            lines = [line[indentation:] for line in value.split('\n')]
            if lines[-1] == '':
                lines.pop()

            value = '\n'.join(lines)

        result[match.group(1)] = value

    return result


class UriwriterDirective(Directive):
    has_content = True
    required_arguments = 0
    optional_arguments = 0
    final_argument_whitespace = True
    
    
      

    def run(self):
        print self.content
        options = parse_keys(self.content)
        print options
       
        if 'target' in options:
            rendered = URIWRITER_TEMPLATE_TARGET.render(options)
        else:
            rendered = URIWRITER_TEMPLATE.render(options)
       
        rendered_lines = statemachine.string2lines(
            rendered, 4, convert_whitespace=1)
        self.state_machine.insert_input(rendered_lines, '')

        return []


def setup(app):
    app.add_directive('uriwriter', UriwriterDirective)

    return {
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }
