'''
working_directory=str(os.environ['PWD'])
print 'Working Directory:' + working_directory
exec_path=str(os.environ['_'])
print 'Executable Path:' + exec_path
scriptDir = os.path.dirname(os.path.realpath(__file__))
print 'Script Directory: ' + scriptDir

if not (working_directory == scriptDir):
	print 'working directory missmatch'
	sys.exit(0)
'''