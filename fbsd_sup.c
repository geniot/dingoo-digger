#include <ctype.h>
#include <stdlib.h>
#include "def.h"
#include "hardware.h"

void strupr(char *str)
{
	while(*str != 0) {
		*str = toupper(*str);
		str++;
	}
}

void catcher(int num) {
#ifndef _DINGOO
//	fprintf(stderr, "Signal %d catched, exitting\n", num);
#endif
	graphicsoff();
	restorekeyb();
	exit(0);
}
	

