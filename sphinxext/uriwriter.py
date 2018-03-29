import fett
import re
from docutils.parsers.rst import Directive, directives
from docutils import statemachine
from docutils.utils.error_reporting import ErrorString


URIWRITER_TEMPLATE = fett.Template('''
.. raw:: html

   <p class="uriwriter">
   
   
   <script type="text/javascript">
               
       //First, add this data to our cache
             
       function addRow() {
           event.preventDefault();
           const elements = document.getElementById('uriwriter').elements;
           var formObj ={};
           for(var i = 0 ; i < elements.length ; i++){
               var item = elements.item(i);
               formObj[item.name] = item.value;
           }
           
           putFormDataInLocalStorage(formObj);
           hollerStateChange();    
       
       }
       
       function putFormDataInLocalStorage(formdata) {
           
           if (null == formdata) {
               console.log("Error persisting formdata");
               return;
           }
        
           localStorage.setItem('uriwriterForm', formdata);
           
       }
       
       function hollerStateChange() {
           const event = new Event('uriwriter');
           console.log("about to dispatch");
           document.dispatchEvent(event);
       }
       
       
           
 
   </script>
   <form class="uriwriter" id="uriwriter" autocomplete="off">
    <fieldset>
    <div id="userinfo" class="row">
    <button id="uriwriter_env" class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">choose
        <span class="caret"></span></button>
            <ul id="uriwriter_sel" class="dropdown-menu">
                <li><a href="#">Standalone MongoDB</a></li>
                <li><a href="#">Atlas (Cloud)</a></li>
                <li><a href="#">Replica Set</a></li>
           </ul>
    </fieldset>
    <fieldset>
      <input id="uriwriter_username" type="text" name="username" required>
      <label for="username">Username</label>
    </fieldset>
    <fieldset>
      <input id="uriwriter_db" type="text" name="db" required>
      <label for="db">Database name</label>
    </fieldset>
    <fieldset>
      <input id="uriwriter_authdb" type="" name="authdb" required>
      <label for="authdb">Authentication database</label>
    </fieldset>
    </div>
    <div class="flex-container">
    
    <div><fieldset class="hostgrid">
      <input id="hostname" type="text" name="hostname" required>
      <label for="hostname">Hostname or IP</label>
    </fieldset>
    <fieldset class="hostgrid">
      <input id="port" type="text" name="port" required>
      <label for="port">Port</label>
    </fieldset>
    <fieldset class="hostgrid">
      <button id="uriwriter_act">+</button>
    </fieldset>
    </div>
      <div id="hostlistwrapper">
    <ul id="hostlist" style="list-style-type:none">
    </ul>
    </div>
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
    print '*************'
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
