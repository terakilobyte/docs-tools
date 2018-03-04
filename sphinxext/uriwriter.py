import fett
import re
from docutils.parsers.rst import Directive, directives
from docutils import statemachine
from docutils.utils.error_reporting import ErrorString

URIWRITER_TEMPLATE = fett.Template('''
.. raw:: html

   <p class="uriwriter"
     data-hello="hi">{{ hello }}
   </p>
''')


class UriwriterDirective(Directive):
    has_content = False
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True

    def run(self):
        data = {'hello': self.arguments[0]}
        rendered = URIWRITER_TEMPLATE.render(data)
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
